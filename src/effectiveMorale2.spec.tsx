import {describe, expect, it} from "vitest";
import {effectiveMorale2} from "./effectiveMorale2.tsx";
import {initialState, SideState, State} from "./state.ts";
import {UnitDef} from "./unitName.tsx";
import {Modifier} from "./modifiers.tsx";
import {Terrain} from "./terrainFromImgName.tsx";

const inf = UnitDef.brand('4w.5b.5w');           // morale 5
const goodInf = UnitDef.brand('7w.5b.1w');       // morale 1
const mg = UnitDef.brand('3w.10b.5w.2.mg');      // low trajectory
const mortar = UnitDef.brand('4w.40w.6w.2.mrt'); // high trajectory
const vehicle = UnitDef.brand('1y.7b.2y.1.vehicle'); // P-2
const milan = UnitDef.brand('14y.9b.0b.2.milan');    // P-0

const open: Terrain = {type: 'open', name: 'clean'};

function stateWith(props: {
  attacker?: UnitDef[],
  defender?: UnitDef[],
  mods?: Modifier[],
  stepLosses?: string[],
  terrain?: Terrain,
}): State {
  const defender: SideState = {
    units: props.defender ?? [inf],
    stepLosses: props.stepLosses ?? [],
    mods: props.mods ?? [],
  };
  return {
    ...initialState,
    attacker: {units: props.attacker ?? [mg], stepLosses: [], mods: []},
    defender,
    terrain: props.terrain ?? open,
  };
}

describe('effectiveMorale2', () => {
  it('is unit morale with no modifiers', () => {
    expect(effectiveMorale2(stateWith({}), 0)).toBe(5);
  });

  it('entire stack checks as a whole, using the worst unit morale in the hex [17.0a]', () => {
    expect(effectiveMorale2(stateWith({defender: [goodInf, inf]}), 0)).toBe(5);
  });

  it('vehicles never make morale checks of their own [17.0a]', () => {
    expect(effectiveMorale2(stateWith({defender: [vehicle]}), 0)).toBeUndefined();
  });

  it('vehicles stacked with infantry are affected by the infantry morale check [17.0a]', () => {
    expect(effectiveMorale2(stateWith({defender: [vehicle, inf]}), 0)).toBe(5 - 1);
  });

  it('adds step losses', () => {
    expect(effectiveMorale2(stateWith({stepLosses: ['1', '2']}), 0)).toBe(5 + 3);
  });

  it('adds Bn morale', () => {
    expect(effectiveMorale2(stateWith({}), 2)).toBe(5 + 2);
  });

  it('Bn morale never drops below zero [17.1]', () => {
    expect(effectiveMorale2(stateWith({}), -2)).toBe(5);
  });

  it.each([
    {mod: 'arty', expected: +1},
    {mod: 'paralyzed', expected: +1},
    {mod: 'night', expected: +1},
    {mod: 'dugin', expected: -2},
    {mod: 'crossfire', expected: +2},
    {mod: 'unassigned', expected: +2},
  ] as const)('$mod: $expected', ({mod, expected}) => {
    expect(effectiveMorale2(stateWith({mods: [mod]}), 0)).toBe(5 + expected);
  });

  it('-1 P-2 or better target in hex', () => {
    expect(effectiveMorale2(stateWith({defender: [inf, vehicle]}), 0)).toBe(5 - 1);
  });

  it('P-0 target in hex does not count', () => {
    expect(effectiveMorale2(stateWith({defender: [inf, milan]}), 0)).toBe(5);
  });

  it.each([
    {type: 'partly pro', expected: -1},
    {type: 'protective', expected: -1},
    {type: 'open', expected: 0},
    {type: 'billiard table', expected: 0},
  ])('terrain $type: $expected', ({type, expected}) => {
    expect(effectiveMorale2(stateWith({terrain: {type, name: 'x'}}), 0)).toBe(5 + expected);
  });

  it('+1 No Low-Trajectory Fires', () => {
    expect(effectiveMorale2(stateWith({attacker: [mortar]}), 0)).toBe(5 + 1);
  });

  it('mixed trajectory fire includes low trajectory', () => {
    expect(effectiveMorale2(stateWith({attacker: [mortar, mg]}), 0)).toBe(5);
  });

  it('sums everything', () => {
    expect(effectiveMorale2(stateWith({
      attacker: [mortar],
      defender: [inf, vehicle],
      stepLosses: ['2'],
      mods: ['arty', 'night', 'dugin', 'unassigned'],
      terrain: {type: 'protective', name: 'x'},
    }), 3)).toBe(5 + 2 + 3 + 1 + 1 - 2 + 2 - 1 - 1 + 1);
  });
});
