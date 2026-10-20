import {describe, expect, it} from "vitest";
import {baseSpottingRange, spotting} from "./spotting.ts";
import {tcsRules} from "./gameRules.ts";
import {UnitDef, unitStats} from "./unit.ts";
import {aa, arty, atGun, fireState, inf, mg, milan, mortar, side, unit, vehicle} from "./fixtures.ts";
import {FireState} from "./state.ts";

const range = (state: FireState) => spotting(state, [], tcsRules).range;

describe('baseSpottingRange', () => {
  it.each([
    {def: inf, expected: 3},
    {def: mortar, expected: 3},
    {def: milan, expected: 3},
    {def: atGun, expected: 3},
    {def: arty, expected: 4},
    {def: aa, expected: 4},
    {def: vehicle, expected: 8},
  ])('$def: $expected', ({def, expected}) => {
    expect(baseSpottingRange(unitStats(UnitDef.brand(def)))).toBe(expected);
  });
});

describe('spotting', () => {
  it('is unlimited with no units', () => {
    expect(range(fireState())).toBe(Infinity);
  });
  it('uses the unit producing the longest Spotting Range [7.1e]', () => {
    expect(range(fireState({defender: side([inf, vehicle, arty])}))).toBe(8);
  });
  it('ignores eliminated units', () => {
    expect(range(fireState({defender: side([inf, unit(vehicle, 1)])}))).toBe(3);
  });

  describe('7.1e example', () => {
    const woods = {name: 'woods', type: 'partly pro'};
    it('Dug In MG in woods is spotted at range 1', () => {
      expect(range(fireState({defender: side([mg], ['dugin']), terrain: woods}))).toBe(1);
    });
    it('... unless it fires', () => {
      expect(range(fireState({defender: side([mg], ['dugin', 'firing']), terrain: woods}))).toBe(6);
    });
    it('Dug In MG spots Move Mode infantry in Open at range 6', () => {
      expect(range(fireState({attacker: side([mg], ['dugin']), defender: side([inf], ['moving'])}))).toBe(6);
    });
  });

  it('13.1 example: Fired target in Partly Protective terrain is spotted at range 8', () => {
    expect(range(fireState({
      defender: side([inf, mg, atGun], ['firing']),
      terrain: {name: 'woods', type: 'partly pro'},
    }))).toBe(8);
  });

  it.each([
    {mods: ['road-moving'], expected: 6},
    {mods: ['twilight'], expected: 2},
    {mods: ['night'], expected: 0},
    {mods: ['night', 'illum'], expected: 2},
    {mods: ['smoke'], expected: 2},
    {mods: ['arty'], expected: 2},
    {mods: ['suppressed'], expected: 2},
  ] as const)('target $mods: $expected', ({mods, expected}) => {
    expect(range(fireState({defender: side([inf], [...mods])}))).toBe(expected);
  });

  it.each([
    {mods: ['smoke'], expected: 2},
    {mods: ['arty'], expected: 2},
    {mods: ['paralyzed'], expected: 2},
  ] as const)('firer $mods: $expected', ({mods, expected}) => {
    expect(range(fireState({attacker: side([inf], [...mods]), defender: side([inf])}))).toBe(expected);
  });

  it('Billiard: +2', () => {
    expect(range(fireState({defender: side([inf]), terrain: {name: 'bridge', type: 'billiard table'}}))).toBe(6);
  });

  it('shifting right off the table is unlimited [7.1a]', () => {
    expect(range(fireState({defender: side([vehicle], ['firing'])}))).toBe(Infinity);
  });

  it('applies the firer shift of the game rules', () => {
    const rules = {...tcsRules, firerSpottingShift: () => ({value: +2, description: 'sights'})};
    const state = fireState({defender: side([inf])});
    expect(spotting(state, [unitStats(UnitDef.brand(milan))], rules).range).toBe(6);
  });
});
