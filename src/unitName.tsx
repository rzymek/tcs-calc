import {Branded} from "branded-types";

export class UnitDef extends Branded<string, 'UnitDef'>() {
}

// './images/units/Arg/00_4w.5b.5w.png' -> '4w.5b.5w'
export function unitName(path: string): UnitDef {
  const fileName = path.split('/').pop()!;            // '00_4w.5b.5w.png'
  const withoutPrefix = fileName.replace(/^\d+[_-]/, ''); // '4w.5b.5w.png'
  const unitDef = withoutPrefix.replace(/\.png$/, '');
  return UnitDef.brand(unitDef);          // '4w.5b.5w'
}

export type UnitStats = {
  fireStrength: number;
  firerType: 'area' | 'point';
  range: number;
  steps: number;
  trajectory:'high'|'low',
} & ({
  targetType: 'area',
  morale: number
} | {
  targetType: 'point' | 'both',
  defenseStrength: number,
})

export function unitStats(unit: UnitDef) {
  return {}
}