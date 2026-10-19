import {State} from "./state.ts";
import {UnitDef, UnitStats, unitStats} from "./unitName.tsx";

function spottingRange(state: State): number {
  return 0;
}

function isAreaTarget(units: UnitDef[]) {
  const areaTargets: UnitStats['targetType'][] = ['area', 'both'];
  return units
    .map(unitStats)
    .some(unit => areaTargets.includes(unit.targetType));
}

export function fireResolution(state: State) {
  const spotRange = spottingRange(state);
  const aTarget = isAreaTarget(state.defender.units);
  return {
    spotted: false,
  }
}