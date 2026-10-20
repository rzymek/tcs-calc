import {SideState, State} from "./state.ts";
import {unitStats} from "./unitName.tsx";
import {Modifier} from "./modifiers.tsx";
import {includesLowTrajectory} from "./includesLowTrajectory.tsx";
import * as R from "remeda";

/**
 * Morale (= Unit Morale + Step Losses + Bn Morale + Mods)
 *
 * MORALE MODIFIERS:
 *   +1 Arty Attack Zone
 *   +1 Paralyzed
 *   +1 Night
 *   -2 Dug In
 *   -1 P-2 or better target in hex
 *   +2 Cross Fire [see 11.4]
 *   -1 Partly Prot. or Protective
 *   +1 No Low-Trajectory Fires
 *   +2 Unassigned [6.3b]
 *
 * 17.0a The entire stack checks Morale as a whole. Vehicles and Carriers never
 * make Morale Checks of their own - returns undefined if no unit in the hex checks.
 * 17.1 Battalion Morale can never drop below zero.
 */
export function moraleBreakdown(state: State, bnMorale: number) {
  const defender = state.defender;
  const targets = defender.units.map(unitStats);
  const moraleValues = targets.flatMap(unit => unit.targetType === 'area' ? [unit.morale] : []);
  if (moraleValues.length === 0) {
    return undefined;
  }
  // worst (highest) morale in the hex
  const unitMorale = Math.max(...moraleValues);
  const stepLosses = R.sumBy(defender.stepLosses, Number);
  const pTwoPlusTarget = targets.some(unit => unit.targetType !== 'area' && unit.defenseStrength >= 2);
  const has = (side: SideState, mod: Modifier) => side.mods.includes(mod);

  const modifiers = [
    {value: +1, description: 'Arty Attack Zone', applies: has(defender, 'arty')},
    {value: +1, description: 'Paralyzed', applies: has(defender, 'paralyzed')},
    {value: +1, description: 'Night', applies: has(defender, 'night')},
    {value: -2, description: 'Dug In', applies: has(defender, 'dugin')},
    {value: -1, description: 'P-2 or better target in hex', applies: pTwoPlusTarget},
    {value: +2, description: 'Cross Fire [see 11.4]', applies: has(defender, 'crossfire')},
    {value: -1, description: 'Partly Prot. or Protective', applies: ['partly pro', 'protective'].includes(state.terrain.type)},
    {value: +1, description: 'No Low-Trajectory Fires', applies: !includesLowTrajectory(state)},
    {value: +2, description: 'Unassigned [6.3b]', applies: has(defender, 'unassigned')},
  ];
  const mods = R.sumBy(modifiers.filter(it => it.applies), it => it.value);
  const effectiveBnMorale = Math.max(0, bnMorale);
  return {
    unitMorale,
    stepLosses,
    bnMorale: effectiveBnMorale,
    modifiers,
    total: unitMorale + stepLosses + effectiveBnMorale + mods,
  };
}

export function effectiveMorale2(state: State, bnMorale: number): number | undefined {
  return moraleBreakdown(state, bnMorale)?.total;
}
