import {Branded} from "branded-types";
import {panic} from "./panic.tsx";

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
  trajectory: 'high' | 'low',
} & ({
  targetType: 'area',
  morale: number
} | {
  targetType: 'point' | 'both',
  defenseStrength: number,
})

const infantrySteps = 5;

export class UnitDefError extends Error {
  constructor(unit: UnitDef) {
    super(`Unit definition [${unit}] does not match <fire><w|y>.<range><b|w>.<morale|defense><w|b|y>[.<steps>w]`);
  }
}

export class UnitDefColorError extends Error {
  constructor(color: string, typeByColor: {}) {
    super(`[${color}] in not one of ${Object.keys(typeByColor)}`);
  }
}

// '<fire><w|y>.<range><b|w>.<morale|defense><w|b|y>[.<steps>]'
export function unitStats(unit: UnitDef): UnitStats {
  const [fire, range, defence, steps] = UnitDef.unbrand(unit).split('.').map(part => {
    const [, value, color] = part.match(/^(\d+)([wby]?)$/) || panic(new UnitDefError(unit));
    return {value: Number(value), color};
  });
  if (!fire || !range || !defence) {
    throw new UnitDefError(unit);
  }
  const YELLOW = 'y';
  const WHITE = 'w';
  const BLACK = 'b';
  const firerByColor: Record<string, UnitStats['firerType']> = {
    [WHITE]: 'area',
    [YELLOW]: 'point',
  }
  const typeByColor: Record<string, UnitStats['targetType']> = {
    ...firerByColor,
    [BLACK]: 'both'
  };
  const base = {
    fireStrength: fire.value,
    firerType: firerByColor[fire.color] || panic(new UnitDefColorError(fire.color, firerByColor)),
    range: range.value,
    trajectory: range.color === WHITE ? 'high' : 'low',
    steps: steps?.value ?? infantrySteps,
  } as const;
  const targetType = typeByColor[defence.color] || panic(new UnitDefColorError(defence.color, typeByColor));
  if (targetType === 'area') {
    return {
      ...base,
      targetType,
      morale: defence.value
    };
  } else {
    return {
      ...base,
      targetType,
      defenseStrength: defence.value
    }
  }
}