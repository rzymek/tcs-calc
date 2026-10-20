import {State} from "./state.ts";
import {countSteps} from "./countSteps.tsx";
import {findByRange} from "./findByRange.tsx";
import {rangeTable} from "./rangeTable.tsx";
import {includesLowTrajectory} from "./includesLowTrajectory.tsx";
import {unitStats} from "./unitName.tsx";

export const areaTargetStackingModifiers = {
  "1-2": -3,
  "3-4": -1,
  "5-7": 0,
  "8-9": 1,
  "10-12": 3,
  "13-19": 6,
  "20+": 10,
};
const areaTargetStackingTable = rangeTable(areaTargetStackingModifiers);

export function areaTargetStacking(state: State, spotted: boolean): number {
  const defenderSteps = countSteps(state.defender);
  if (defenderSteps === 0) {
    return 0;
  }
  const value = findByRange(areaTargetStackingTable, defenderSteps);
  const isArty = state.attacker.units.map(unitStats).some(unit => unit.type === 'arty');
  const possiblePenalty = isArty || (
    includesLowTrajectory(state) && !spotted
  )
  return possiblePenalty ? value : Math.max(0, value);
}
