import {describe, expect, it} from "vitest";
import {areaTargetStacking} from "./areaTargetStacking.tsx";
import {initialState, State} from "./state.ts";
import {UnitDef} from "./unitName.tsx";

const inf = UnitDef.brand('4w.5b.5w');            // 5 steps, low trajectory
const oneStep = UnitDef.brand('1w.2b.1w.1');      // 1 step
const mortar = UnitDef.brand('4w.40w.6w.2.mrt');  // high trajectory
const arty = UnitDef.brand('6w.40w.0b.3.arty');

function stateWith(attacker: UnitDef[], defender: UnitDef[], stepLosses: string[] = []): State {
  return {
    ...initialState,
    attacker: {units: attacker, stepLosses: [], mods: []},
    defender: {units: defender, stepLosses, mods: []},
  };
}

describe('areaTargetStacking', () => {
  it('is 0 with no target steps', () => {
    expect(areaTargetStacking(stateWith([arty], []), true)).toBe(0);
  });

  it.each([
    {defender: [inf], expected: 0},
    {defender: [inf, inf], expected: 3},
    {defender: [inf, inf, inf], expected: 6},
    {defender: [inf, inf, inf, inf], expected: 10},
  ])('$expected for $defender.length infantry units', ({defender, expected}) => {
    expect(areaTargetStacking(stateWith([inf], defender), true)).toBe(expected);
  });

  it('subtracts step losses', () => {
    expect(areaTargetStacking(stateWith([inf], [inf, inf], ['2']), true)).toBe(1);
  });

  describe('negative modifiers', () => {
    it('do not apply to spotted direct fire', () => {
      expect(areaTargetStacking(stateWith([inf], [oneStep]), true)).toBe(0);
    });
    it('apply to unspotted fire including low-trajectory firers', () => {
      expect(areaTargetStacking(stateWith([inf], [oneStep]), false)).toBe(-3);
    });
    it('do not apply to unspotted high-trajectory only fire', () => {
      expect(areaTargetStacking(stateWith([mortar], [oneStep]), false)).toBe(0);
    });
    it('apply to artillery', () => {
      expect(areaTargetStacking(stateWith([arty], [oneStep]), true)).toBe(-3);
    });
  });
});
