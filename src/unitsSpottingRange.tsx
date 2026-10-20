import {UnitDef, unitStats} from "./unitName.tsx";
import * as R from "remeda";
import {isNumber} from "remeda";

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
    R.firstBy([R.identity(), 'desc'])
  ) ?? Infinity;
}

export function unitsSpottingRange(units: UnitDef[]): number {
  return R.pipe(units,
    R.map(unitSpottingRange),
    R.firstBy([R.identity(), 'desc'])
  ) ?? Infinity;
}