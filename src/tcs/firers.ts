import {GameRules} from "./gameRules.ts";
import {FireState, has} from "./state.ts";
import {counter, Counter, UnitStats} from "./unit.ts";

export type Firer = Counter & {
  /** why the unit can't take part in the fire */
  restriction?: string,
}

export function firers(state: FireState, rules: GameRules): Firer[] {
  return state.attacker.units.map(unit => {
    const it = counter(unit);
    return {...it, restriction: restriction(it)};
  });

  function restriction({stats, steps}: Counter) {
    if (steps === 0) {
      return 'Eliminated';
    }
    if (has(state.attacker, 'paralyzed')) {
      return 'Paralyzed units may fire only in Assault combat [9.1d]';
    }
    const rangeRestriction = state.fireType === 'area'
      ? areaFireRestriction(stats, state.distance)
      : pointFireRestriction(stats, state.distance, rules);
    return rangeRestriction ?? rules.fireRestriction(stats, state);
  }
}

export function activeFirers(firers: Firer[]): Firer[] {
  return firers.filter(it => it.restriction === undefined);
}

function areaFireRestriction(stats: UnitStats, distance: number) {
  if (stats.firerType === 'area' && distance > stats.range) {
    return 'Beyond maximum range [11.1a]';
  }
  if (stats.firerType === 'point' && distance > 2 * stats.range) {
    return 'Beyond twice the nominal range [11.1e]';
  }
  return undefined;
}

function pointFireRestriction(stats: UnitStats, distance: number, rules: GameRules) {
  if (stats.firerType !== 'point') {
    return 'Not a P-firer';
  }
  if (rules.pointFireRange(stats, distance) === undefined) {
    return 'Beyond twice the nominal range [12.1b]';
  }
  return undefined;
}
