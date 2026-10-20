import * as R from "remeda";
import {GameRules, RangeCategory} from "./gameRules.ts";
import {FireState} from "./state.ts";
import {counter, Counter, UnitStats} from "./unit.ts";

export const pointFireRangeModifiers: Record<RangeCategory, number> = {
  close: +5,
  nominal: +3,
  long: 0,
};

/** 12.1b apply the range modifier of the firing unit that favors the defender most */
export function pointFireRange(firers: UnitStats[], distance: number, rules: GameRules): number {
  const modifiers = firers.flatMap(unit => {
    const category = rules.pointFireRange(unit, distance);
    return category === undefined ? [] : [pointFireRangeModifiers[category]];
  });
  return modifiers.length > 0 ? Math.min(...modifiers) : 0;
}

/** undefined: fire not allowed */
export const differentialModifiers = [
  ['+3 or higher', +3],
  ['+2', +2],
  ['+1', +1],
  ['0', 0],
  ['–1', -2],
  ['–2', -4],
  ['–3', -8],
  ['–4', -12],
  ['–5 or lower', undefined],
] as const;

export function differentialRow(differential: number) {
  return 3 - R.clamp(differential, {min: -5, max: 3});
}

/** 12.1c the attacking unit with the lowest Point Fire strength minus the best P-defense of the defending units */
export function differential(firers: UnitStats[], targets: UnitStats[]) {
  if (firers.length === 0 || targets.length === 0) {
    return {firerStrength: 0, targetDefense: 0, value: 0, shift: 0};
  }
  const firerStrength = Math.min(...firers.map(unit => unit.fireStrength));
  const targetDefense = Math.max(...targets.map(unit => unit.targetType === 'area' ? 0 : unit.defenseStrength));
  const value = firerStrength - targetDefense;
  return {firerStrength, targetDefense, value, shift: differentialModifiers[differentialRow(value)][1]};
}

/** 12.0 Point targets and B-targets in the target hex */
export function pointTargets(state: FireState, rules: GameRules): Counter[] {
  return state.defender.units
    .map(counter)
    .flatMap(target => {
      const stats = rules.pointTarget(target.stats, state);
      return target.steps > 0 && stats !== undefined ? [{...target, stats}] : [];
    });
}
