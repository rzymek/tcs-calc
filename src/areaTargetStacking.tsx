import {State} from "./state.ts";
import * as R from "remeda";
import {unitStats} from "./unitName.tsx";
import {countSteps} from "./countSteps.tsx";
import {findByRange} from "./findByRange.tsx";
import {rangeTable} from "./rangeTable.tsx";

const areaTargetStackingTable = rangeTable({
  "1-2": -3,
  "3-4": -1,
  "5-7": 0,
  "8-9": 1,
  "10-12": 3,
  "13-19": 6,
  "20+": 10,
});

export function areaTargetStacking(state: State, spotted: boolean): number {
  const defenderSteps = countSteps(state.defender);
  if (defenderSteps === 0) {
    return 0;
  }
  const value = findByRange(areaTargetStackingTable, defenderSteps);
  const possiblePenalty = state.firererType === 'arty' || (
    includesLowTrajectory(state) && !spotted
  )
  return possiblePenalty ? value : Math.max(0, value);
}

export function includesLowTrajectory(state: State) {
  return R.pipe(state.attacker.units,
    R.map(unitStats),
    R.filter(unit => unit.trajectory === 'low'),
    R.hasAtLeast(1)
  );
}
