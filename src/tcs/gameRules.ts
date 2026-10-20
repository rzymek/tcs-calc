import {UnitStats} from "./unit.ts";
import {FireState} from "./state.ts";

export type RangeCategory = 'close' | 'nominal' | 'long';

/**
 * Hooks where game-specific rules override the TCS series rules.
 * The defaults in {@link tcsRules} follow the TCS v4.02 series rules.
 */
export interface GameRules {
  /** Morale used in Morale Checks; undefined for units that never check (Vehicles, Carriers) [17.0a] */
  unitMorale(unit: UnitStats, nation: string): number | undefined;

  /** whether the +1 Night Morale modifier applies to units of the nation */
  nightMoraleModifier(nation: string): boolean;

  /** Area Fire strength of a firer with the given number of remaining steps */
  areaFireStrength(unit: UnitStats, steps: number): number;

  /** reason the unit may not take part in the fire, if any */
  fireRestriction(unit: UnitStats, state: FireState): string | undefined;

  /** reminders of rules the players have to resolve themselves */
  notes(state: FireState): string[];

  /** firer shift on the Spotting Range Table */
  firerSpottingShift(unit: UnitStats): { value: number, description: string } | undefined;

  /** Point Fire range category, undefined if beyond range */
  pointFireRange(unit: UnitStats, distance: number): RangeCategory | undefined;

  /** the unit as a Point Fire target, undefined if Point Fires can't target it */
  pointTarget(unit: UnitStats, state: FireState): UnitStats | undefined;

  /** whether Point Fire step losses require a Morale Check */
  pointFireMoraleCheck(state: FireState): boolean;
}

// 11.1f, 24.6b Multi-step Vehicle, gun, and On-Map Artillery units fire with steps x Fire rating
const multiStepFirers = ['arty', 'ig', 'aa', 'at', 'vehicle'];

/**
 * 12.1b Close: up to one-half the printed range, rounded up;
 * Nominal: up to the printed range; Long: up to twice the printed range.
 */
export function pointFireRangeCategory(range: number, distance: number): RangeCategory | undefined {
  if (distance <= Math.ceil(range / 2)) {
    return 'close';
  }
  if (distance <= range) {
    return 'nominal';
  }
  if (distance <= 2 * range) {
    return 'long';
  }
  return undefined;
}

export const tcsRules: GameRules = {
  unitMorale(unit) {
    if (unit.targetType === 'area') {
      return unit.morale;
    }
    // 24.6a On-Map Artillery units are B-0 targets with a Morale of 6
    if (unit.type === 'arty') {
      return 6;
    }
    return undefined;
  },
  nightMoraleModifier: () => true,
  areaFireStrength(unit, steps) {
    if (steps <= 0) {
      return 0;
    }
    const strength = multiStepFirers.includes(unit.type) ? unit.fireStrength * steps : unit.fireStrength;
    // 9.1f AT guns conduct Area Fires at 1/2 Fire strength
    return unit.type === 'at' ? strength / 2 : strength;
  },
  fireRestriction: () => undefined,
  notes: () => [],
  firerSpottingShift: () => undefined,
  pointFireRange: (unit, distance) => pointFireRangeCategory(unit.range, distance),
  // 12.2d B-targets with a Morale Value on their counter have a Defense value of 0
  pointTarget: unit => unit.targetType === 'area' ? undefined : unit,
  // 12.2f Point Fires never cause Morale Checks
  pointFireMoraleCheck: () => false,
};
