import * as R from "remeda";
import {GameRules} from "./gameRules.ts";
import {FireState, has, isProtective, TableModifier} from "./state.ts";
import {UnitStats, unitStats} from "./unit.ts";
import {includesLowTrajectory} from "./areaFire.ts";
import {crossFirePossible, pTwoPlusTargetInHex} from "./otherModifiers.ts";
import {fireResultLosses, FireResult} from "./firetable.ts";
import {morale, moraleTable} from "./morale.ts";
import {rolls2d6} from "./dice.ts";

type LossTaker = { morale: number | undefined, steps: number, losses: number };

/**
 * Losses after a Fire Table result, approximating 10.0f: the first loss comes from the largest
 * unit, the defender then assigns half of the remaining losses (rounded) to keep the worst Morale
 * low, and the attacker assigns the rest to the unit with the worst Morale.
 * 10.0e Losses in excess of the number of steps in a stack are ignored.
 */
export function assignLosses(units: LossTaker[], newLosses: number): number[] {
  const losses = units.map(unit => Math.min(unit.losses, unit.steps));
  const remaining = (idx: number) => units[idx].steps - losses[idx];
  // units without Morale don't matter for the Morale Check
  const value = (idx: number) => (units[idx].morale ?? -Infinity) + losses[idx];
  const eligible = () => R.range(0, units.length).filter(idx => remaining(idx) > 0);
  const take = (idx: number | undefined) => idx !== undefined && losses[idx]++;

  let toAssign = Math.min(newLosses, R.sumBy(R.range(0, units.length), remaining));
  if (toAssign === 0) {
    return losses;
  }
  take(R.firstBy(eligible(), [remaining, 'desc'], [value, 'asc']));
  toAssign--;
  const defenderShare = Math.round(toAssign / 2);
  R.range(0, defenderShare).forEach(() => take(R.firstBy(eligible(), [value, 'asc'])));
  R.range(0, toAssign - defenderShare).forEach(() => take(R.firstBy(eligible(), [value, 'desc'])));
  return losses;
}

/**
 * Morale (= Unit Morale + Step Losses + Bn Morale + Mods)
 *
 * 17.0a The entire stack checks Morale as a whole. Vehicles and Carriers never
 * make Morale Checks of their own - returns undefined if no unit in the hex checks.
 * 17.1 Battalion Morale can never drop below zero.
 * 17.2a The unit with the greatest total of printed Morale, step losses and Battalion Morale checks.
 * Eliminated units are eligible.
 */
export function moraleBreakdown(state: FireState, firers: UnitStats[], rules: GameRules, newLosses = 0) {
  const {defender} = state;
  const units = defender.units
    .map(unit => ({unit, stats: unitStats(unit.def)}))
    .filter(({stats}) => stats.targetType !== 'point');
  const losses = assignLosses(units.map(({unit, stats}) => ({
    morale: rules.unitMorale(stats, defender.nation),
    steps: stats.steps,
    losses: unit.losses,
  })), newLosses);
  const checking = units.flatMap(({stats}, idx) => {
    const unitMorale = rules.unitMorale(stats, defender.nation);
    return unitMorale === undefined ? [] : [{unitMorale, stepLosses: losses[idx]}];
  });
  const worst = R.firstBy(checking, [it => it.unitMorale + it.stepLosses, 'desc']);
  if (worst === undefined) {
    return undefined;
  }
  const modifiers: TableModifier[] = [
    {value: +1, description: 'Arty Attack Zone', applies: has(defender, 'arty')},
    {value: +1, description: 'Paralyzed', applies: has(defender, 'paralyzed')},
    {value: +1, description: 'Night', applies: has(defender, 'night') && rules.nightMoraleModifier(defender.nation)},
    {value: -2, description: 'Dug In', applies: has(defender, 'dugin')},
    {value: -1, description: 'P-2 or better target in hex', applies: pTwoPlusTargetInHex(state)},
    {value: +2, description: 'Cross Fire [see 11.4]', applies: has(defender, 'crossfire') && crossFirePossible(firers)},
    {value: -1, description: 'Partly Prot. or Protective', applies: isProtective(state.terrain)},
    {value: +1, description: 'No Low-Trajectory Fires', applies: !includesLowTrajectory(firers)},
    {value: +2, description: 'Unassigned [6.3b]', applies: has(defender, 'unassigned')},
  ];
  const mods = R.sumBy(modifiers.filter(it => it.applies), it => it.value);
  const bnMorale = Math.max(0, defender.bnMorale);
  return {
    ...worst,
    bnMorale,
    modifiers,
    total: worst.unitMorale + worst.stepLosses + bnMorale + mods,
  };
}

export const noMoraleCheck = 'No check';

/**
 * Morale Check outcome over all fire and morale rolls. The Morale Check follows the fire,
 * so its Morale includes the step losses inflicted by the fire.
 */
export function moraleDistribution(fireResult: (roll: number) => FireResult, moraleTotal: (newLosses: number) => number | undefined) {
  const probability = new Map<string, number>();
  const add = (label: string, p: number) => probability.set(label, (probability.get(label) ?? 0) + p);
  const p = 1 / rolls2d6.length;
  rolls2d6.forEach(fireRoll => {
    const losses = fireResultLosses(fireResult(fireRoll));
    const total = losses === undefined ? undefined : moraleTotal(losses);
    if (total === undefined) {
      add(noMoraleCheck, p);
      return;
    }
    rolls2d6.forEach(moraleRoll => {
      const {result} = morale(total, moraleRoll);
      if (result !== undefined) {
        add(result, p * p);
      }
    });
  });
  return [noMoraleCheck, ...moraleTable.map(([label]) => label)]
    .filter(label => probability.has(label))
    .map(label => ({label, p: probability.get(label)!}));
}
