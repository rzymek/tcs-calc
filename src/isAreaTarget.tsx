import {UnitDef, unitStats, UnitStats} from "./unitName.tsx";

function isAreaTarget(units: UnitDef[]) {
  const areaTargets: UnitStats['targetType'][] = ['area', 'both'];
  return units
    .map(unitStats)
    .some(unit => areaTargets.includes(unit.targetType));
}