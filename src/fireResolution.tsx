import {State} from "./state.ts";
import {UnitDef, UnitStats, unitStats} from "./unitName.tsx";
import * as R from "remeda";
import {isNumber} from "remeda";
import {countSteps} from "./countSteps.tsx";

const spottingTable = {
  area: 3,
  both: 3,
  at: 4,
  arty: 4,
  aa: 4,
  ig: 4,
  point: 8,
} as const;

function unitSpottingRange(def: UnitDef): number {
  const unit = unitStats(def);
  return R.pipe([
      spottingTable[unit.type as keyof typeof spottingTable],
      spottingTable[unit.targetType as keyof typeof spottingTable],
    ],
    R.filter(isNumber),
    R.maxBy(R.identity)
  ) ?? Infinity;
}

function unitsSpottingRange(units:UnitDef[]): number {
  return R.pipe(units,
    R.map(unitSpottingRange),
    R.maxBy(R.identity)
  ) ?? Infinity;
}

function isAreaTarget(units: UnitDef[]) {
  const areaTargets: UnitStats['targetType'][] = ['area', 'both'];
  return units
    .map(unitStats)
    .some(unit => areaTargets.includes(unit.targetType));
}

export function fireResolution(state: State) {
  const spottingRange = unitsSpottingRange(state.defender.units);
  const aTarget = isAreaTarget(state.defender.units);
  return {
    spottingRange,
    aTarget,
    firerSteps: countSteps(state.attacker),
    spotted: state.distance <= spottingRange,
  }
}