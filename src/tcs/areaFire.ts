import * as R from "remeda";
import {Firer} from "./firers.ts";
import {GameRules} from "./gameRules.ts";
import {SideState} from "./state.ts";
import {counter, Counter, UnitStats} from "./unit.ts";
import {rangeTable} from "../rangeTable.tsx";
import {findByRange} from "../findByRange.tsx";

/** Total the applied Fire strength [11.0], 11.1d A-firers and P-firers combine */
export function areaFirepower(firers: Firer[], rules: GameRules): number {
  return Math.round(R.sumBy(firers, it => rules.areaFireStrength(it.stats, it.steps)));
}

export function infSteps(firers: Counter[]) {
  return R.sumBy(firers.filter(it => it.stats.type === 'inf'), it => it.steps);
}

/**
 * 11.3d At range zero, add the number of Infantry steps remaining to the total Fire strength.
 * At range one, add one-half of all Infantry steps, rounding normally.
 */
export function infFirepower(firers: Counter[], distance: number) {
  const steps = infSteps(firers);
  if (distance === 0) {
    return steps;
  }
  if (distance === 1) {
    return Math.round(steps / 2);
  }
  return 0;
}

interface AreaFireRangeColumn {
  inf: number,
  low: number,
  high: number,
  mrt: number,
}

export const areaFireRangeModifiers = {
  '0': {inf: +4, low: +4, high: +4, mrt: 0},
  '1': {inf: +2, low: +2, high: +2, mrt: 0},
  '2': {inf: +1, low: +1, high: +1, mrt: 0},
  '3': {inf: 0, low: 0, high: 0, mrt: 0},
  '4': {inf: -1, low: 0, high: 0, mrt: 0},
  '5': {inf: -2, low: -1, high: 0, mrt: 0},
  '6-8': {inf: -3, low: -2, high: 0, mrt: 0},
  '9+': {inf: -6, low: -3, high: 0, mrt: 0},
} satisfies Record<string, AreaFireRangeColumn>;
const areaFireRangeTable = rangeTable(areaFireRangeModifiers)

/*
11.3c Range. Find the range modifier
for each firing unit on the Area Fire Range
Modifier Table and apply the one that most
favors the defender.
The row for Low-Trajectory covers all
Low-Trajectory firers except Infantry.
 */
export function areaFireRange(firers: UnitStats[], distance: number) {
  const column = findByRange(areaFireRangeTable, distance);
  const modifiers = firers.map(stats => column[rowOf(stats)]);
  return modifiers.length > 0 ? Math.min(...modifiers) : 0;
}

export function rowOf(stats: UnitStats): keyof AreaFireRangeColumn {
  if (stats.type === 'inf') {
    return 'inf';
  }
  if (stats.type === 'mrt') {
    return 'mrt';
  }
  return stats.trajectory;
}

export function includesLowTrajectory(firers: UnitStats[]) {
  return firers.some(unit => unit.trajectory === 'low');
}

/**
 * Units in the target hex affected by the Area Fire:
 * 11.1a Area Fires do not affect Point targets.
 * 11.1b B-1 targets take losses from Area Fires only if none of the firing units is an Infantry unit.
 */
export function areaTargets(defender: SideState, firers: UnitStats[]): Counter[] {
  const infantryFiring = firers.some(unit => unit.type === 'inf');
  return defender.units
    .map(counter)
    .filter(({stats, steps}) => steps > 0 && isAreaTarget(stats, infantryFiring));
}

function isAreaTarget(stats: UnitStats, infantryFiring: boolean) {
  if (stats.targetType === 'point') {
    return false;
  }
  return !(stats.targetType === 'both' && stats.defenseStrength >= 1 && infantryFiring);
}

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

/**
 * 11.3e count the steps in the hex affected by the attack.
 * 7.1d Unspotted SFAs that include any Low-Trajectory firers use the Stacking modifiers with an asterisk.
 */
export function areaTargetStacking(targetSteps: number, ops: { spotted: boolean, lowTrajectory: boolean }): number {
  if (targetSteps === 0) {
    return 0;
  }
  const value = findByRange(areaTargetStackingTable, targetSteps);
  return !ops.spotted && ops.lowTrajectory ? value : Math.max(0, value);
}
