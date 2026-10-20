import {describe, expect, it} from "vitest";
import {otherModifiers} from "./otherModifiers.ts";
import {UnitDef, unitStats} from "./unit.ts";
import {FireState, FireType, SideState} from "./state.ts";
import {arty, fireState, inf, mg, mortar, side, vehicle} from "./fixtures.ts";

function stateWith(attacker: SideState, defender: SideState, distance = 3, fireType: FireType = 'area'): FireState {
  return fireState({attacker, defender, distance, fireType});
}

function total(state: FireState) {
  const firers = state.attacker.units.map(unit => unitStats(unit.def));
  return otherModifiers(state, firers).total;
}

describe('otherModifiers', () => {
  it('no modifiers', () => {
    expect(total(stateWith(side([inf]), side([inf])))).toBe(0);
  });

  describe('target', () => {
    it.each([
      {mod: 'night', expected: -2},
      {mod: 'twilight', expected: -1},
      {mod: 'road-moving', expected: +2},
      {mod: 'suppressed', expected: -2},
      {mod: 'paralyzed', expected: -2},
      {mod: 'arty', expected: -2},
      {mod: 'smoke', expected: -1},
    ] as const)('$mod: $expected', ({mod, expected}) => {
      expect(total(stateWith(side([inf]), side([inf], [mod])))).toBe(expected);
    });

    it('illuminated at night: -1 instead of -2 [26.2b]', () => {
      expect(total(stateWith(side([inf]), side([inf], ['night', 'illum'])))).toBe(-1);
    });

    it('illum alone has no effect', () => {
      expect(total(stateWith(side([inf]), side([inf], ['illum'])))).toBe(0);
    });

    it('night applies to On-Map Artillery direct fire [24.6b]', () => {
      expect(total(stateWith(side([arty]), side([inf], ['night'])))).toBe(-2);
    });

    it('suppressed/paralyzed does not apply at range 0', () => {
      expect(total(stateWith(side([inf]), side([inf], ['suppressed']), 0))).toBe(0);
    });

    it('P-2+ target in hex applies to low-trajectory area fire', () => {
      expect(total(stateWith(side([mg]), side([inf, vehicle])))).toBe(-2);
    });

    it('P-2+ target in hex does not apply to high-trajectory fire', () => {
      expect(total(stateWith(side([arty]), side([inf, vehicle])))).toBe(0);
    });

    it('P-2+ target in hex does not apply to Point Fire', () => {
      expect(total(stateWith(side([vehicle]), side([inf, vehicle]), 3, 'point'))).toBe(0);
    });
  });

  describe('firer', () => {
    it.each([
      {mod: 'suppressed', expected: -2},
      {mod: 'paralyzed', expected: -2},
      {mod: 'arty', expected: -2},
      {mod: 'smoke', expected: -1},
    ] as const)('$mod: $expected', ({mod, expected}) => {
      expect(total(stateWith(side([inf], [mod]), side([inf])))).toBe(expected);
    });

    it('cross fire: +4 (marked on target)', () => {
      expect(total(stateWith(side([inf, mg]), side([inf], ['crossfire'])))).toBe(4);
    });

    it('cross fire needs two Low-Trajectory firers [11.4]', () => {
      expect(total(stateWith(side([inf]), side([inf], ['crossfire'])))).toBe(0);
      expect(total(stateWith(side([inf, mortar]), side([inf], ['crossfire'])))).toBe(0);
    });
  });

  it('both sides are cumulative', () => {
    expect(total(stateWith(
      side([inf], ['arty', 'smoke']),
      side([inf], ['arty', 'smoke']),
    ))).toBe(-6);
  });

  it('lists applied modifiers with descriptions', () => {
    const state = stateWith(
      side([mg, inf], ['suppressed', 'smoke']),
      side([inf, vehicle], ['night', 'crossfire', 'arty']),
    );
    expect(otherModifiers(state, [mg, inf].map(def => unitStats(UnitDef.brand(def))))).toEqual({
      modifiers: [
        {value: -2, description: 'Target: Night'},
        {value: -2, description: 'Target: P-2+ target in hex'},
        {value: -2, description: 'Firer: Any Suppressed or Paralyzed'},
        {value: +4, description: 'Firer: Cross fire'},
        {value: -1, description: 'Firer: Smoke'},
        {value: -2, description: 'Target: Arty Attack Zone'},
      ],
      total: -2 - 2 - 2 + 4 - 1 - 2,
    });
  });
});
