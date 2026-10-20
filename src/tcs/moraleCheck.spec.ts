import {describe, expect, it} from "vitest";
import * as R from "remeda";
import {assignLosses, moraleBreakdown, moraleDistribution, noMoraleCheck} from "./moraleCheck.ts";
import {tcsRules} from "./gameRules.ts";
import {FireState, Modifier, Terrain} from "./state.ts";
import {UnitDef, UnitState, unitStats} from "./unit.ts";
import {arty, atGun, fireState, goodInf, inf, mg, milan, mortar, side, unit, vehicle} from "./fixtures.ts";
import {fireTable} from "./firetable.ts";

function stateWith(props: {
  attacker?: string[],
  defender?: (string | UnitState)[],
  mods?: Modifier[],
  terrain?: Terrain,
  bnMorale?: number,
}): FireState {
  return fireState({
    attacker: side(props.attacker ?? [mg]),
    defender: side(props.defender ?? [inf], props.mods ?? [], {bnMorale: props.bnMorale ?? 0}),
    terrain: props.terrain ?? {type: 'open', name: 'clean'},
  });
}

function moraleOf(state: FireState, newLosses = 0) {
  const firers = state.attacker.units.map(it => unitStats(it.def));
  return moraleBreakdown(state, firers, tcsRules, newLosses)?.total;
}

describe('moraleBreakdown', () => {
  it('is unit morale with no modifiers', () => {
    expect(moraleOf(stateWith({}))).toBe(5);
  });

  it('entire stack checks as a whole, using the worst unit morale in the hex [17.0a]', () => {
    expect(moraleOf(stateWith({defender: [goodInf, inf]}))).toBe(5);
  });

  it('the worst unit includes its own step losses [17.2a]', () => {
    expect(moraleOf(stateWith({defender: [unit('4w.5b.4w', 3), inf]}))).toBe(4 + 3);
  });

  it('eliminated units are eligible, with step losses equal to their full strength [17.2a]', () => {
    expect(moraleOf(stateWith({defender: [unit('4w.5b.4w', 5), inf]}))).toBe(4 + 5);
  });

  it('vehicles never make morale checks of their own [17.0a]', () => {
    expect(moraleOf(stateWith({defender: [vehicle]}))).toBeUndefined();
  });

  it('vehicles stacked with infantry are affected by the infantry morale check [17.0a]', () => {
    expect(moraleOf(stateWith({defender: [vehicle, inf]}))).toBe(5 - 1);
  });

  it('On-Map Artillery has a Morale of 6 [24.6a]', () => {
    expect(moraleOf(stateWith({defender: [arty]}))).toBe(6);
  });

  it('B-targets without Morale do not check', () => {
    expect(moraleOf(stateWith({defender: [atGun]}))).toBeUndefined();
  });

  it('adds Bn morale', () => {
    expect(moraleOf(stateWith({bnMorale: 2}))).toBe(5 + 2);
  });

  it('Bn morale never drops below zero [17.1]', () => {
    expect(moraleOf(stateWith({bnMorale: -2}))).toBe(5);
  });

  it.each([
    {mod: 'arty', expected: +1},
    {mod: 'paralyzed', expected: +1},
    {mod: 'night', expected: +1},
    {mod: 'dugin', expected: -2},
    {mod: 'unassigned', expected: +2},
  ] as const)('$mod: $expected', ({mod, expected}) => {
    expect(moraleOf(stateWith({mods: [mod]}))).toBe(5 + expected);
  });

  it('cross fire: +2 with two Low-Trajectory firers', () => {
    expect(moraleOf(stateWith({mods: ['crossfire'], attacker: [mg, inf]}))).toBe(5 + 2);
    expect(moraleOf(stateWith({mods: ['crossfire'], attacker: [mg]}))).toBe(5);
  });

  it('-1 P-2 or better target in hex', () => {
    expect(moraleOf(stateWith({defender: [inf, vehicle]}))).toBe(5 - 1);
  });

  it('P-0 target in hex does not count', () => {
    expect(moraleOf(stateWith({defender: [inf, milan]}))).toBe(5);
  });

  it.each([
    {type: 'partly pro', expected: -1},
    {type: 'protective', expected: -1},
    {type: 'open', expected: 0},
    {type: 'billiard table', expected: 0},
  ])('terrain $type: $expected', ({type, expected}) => {
    expect(moraleOf(stateWith({terrain: {type, name: 'x'}}))).toBe(5 + expected);
  });

  it('+1 No Low-Trajectory Fires', () => {
    expect(moraleOf(stateWith({attacker: [mortar]}))).toBe(5 + 1);
  });

  it('mixed trajectory fire includes low trajectory', () => {
    expect(moraleOf(stateWith({attacker: [mortar, mg]}))).toBe(5);
  });

  it('sums everything', () => {
    expect(moraleOf(stateWith({
      attacker: [mortar],
      defender: [unit(inf, 2), vehicle],
      mods: ['arty', 'night', 'dugin', 'unassigned'],
      terrain: {type: 'protective', name: 'x'},
      bnMorale: 3,
    }))).toBe(5 + 2 + 3 + 1 + 1 - 2 + 2 - 1 - 1 + 1);
  });

  it('17.2 example: 4 Morale + 3 Steps Lost + 1 Battalion Morale + 1 Night = 9', () => {
    expect(moraleOf(stateWith({defender: [unit('4w.5b.4w', 3)], bnMorale: 1, mods: ['night']}))).toBe(9);
  });

  it('includes the step losses of the fire', () => {
    expect(moraleOf(stateWith({}), 2)).toBe(5 + 2);
  });
});

describe('assignLosses', () => {
  const platoon = (morale: number) => ({morale, steps: 5, losses: 0});

  it('10.0f example: eight losses on two platoons and an AT gun', () => {
    // first loss from the largest unit, then the defender assigns 4 and the attacker 3
    expect(assignLosses([platoon(4), platoon(5), {morale: undefined, steps: 1, losses: 0}], 8)).toEqual([5, 2, 1]);
  });

  it('the first loss comes from the largest unit', () => {
    expect(assignLosses([{morale: 1, steps: 2, losses: 0}, platoon(5)], 1)).toEqual([0, 1]);
  });

  it('ignores losses in excess of the steps in the stack [10.0e]', () => {
    expect(assignLosses([{morale: 5, steps: 2, losses: 1}], 5)).toEqual([2]);
  });

  it('keeps existing losses', () => {
    expect(assignLosses([{morale: 5, steps: 5, losses: 2}], 0)).toEqual([2]);
  });
});

describe('moraleDistribution', () => {
  it('adds up to 1', () => {
    const rows = moraleDistribution(roll => fireTable.result({firepower: 12, shift: 0}, roll), losses => 5 + losses);
    expect(R.sumBy(rows, it => it.p)).toBeCloseTo(1);
    expect(rows[0].label).toBe(noMoraleCheck);
  });
  it('no Morale Check if no unit checks', () => {
    const rows = moraleDistribution(() => '-1 step', () => undefined);
    expect(rows.map(it => it.label)).toEqual([noMoraleCheck]);
    expect(rows[0].p).toBeCloseTo(1);
  });
  it('uses the Morale after the fire losses', () => {
    const rows = moraleDistribution(() => '-2 steps', losses => 11 + losses);
    // column 13+: no "No Effect" or "Suppressed"
    expect(rows.map(it => it.label)).toEqual(['SYR', 'Paralyzed', 'Surrender']);
  });
});

describe('fixtures', () => {
  it('unit defs parse', () => {
    [arty, atGun, goodInf, inf, mg, milan, mortar, vehicle].forEach(def => expect(() => unitStats(UnitDef.brand(def))).not.toThrow());
  });
});
