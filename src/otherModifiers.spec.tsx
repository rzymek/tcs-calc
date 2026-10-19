import {describe, expect, it} from "vitest";
import {otherModifiers} from "./otherModifiers.tsx";
import {UnitDef} from "./unitName.tsx";
import {SideState} from "./state.ts";
import {Modifier} from "./modifiers.tsx";

const inf = UnitDef.brand('4w.5b.5w');
const mg = UnitDef.brand('3w.10b.5w.2.mg');
const arty = UnitDef.brand('6w.40w.0b.3.arty');
const vehicle = UnitDef.brand('1y.7b.2y.1.vehicle');

function side(units: UnitDef[], mods: Modifier[] = []): SideState {
  return {units, mods, stepLosses: []};
}

function total(...args: Parameters<typeof otherModifiers>) {
  return otherModifiers(...args).total;
}

describe('otherModifiers', () => {
  it('no modifiers', () => {
    expect(total(side([inf]), side([inf]), 3)).toBe(0);
  });

  describe('target', () => {
    it.each([
      {mod: 'night', expected: -2},
      {mod: 'illum', expected: -1},
      {mod: 'twilight', expected: -1},
      {mod: 'road-moving', expected: +2},
      {mod: 'suppressed', expected: -2},
      {mod: 'paralyzed', expected: -2},
      {mod: 'arty', expected: -2},
      {mod: 'smoke', expected: -1},
    ] as const)('$mod: $expected', ({mod, expected}) => {
      expect(total(side([inf]), side([inf], [mod]), 3)).toBe(expected);
    });

    it.each(['night', 'illum', 'twilight', 'smoke'] as const)('%s does not apply to artillery', mod => {
      expect(total(side([arty]), side([inf], [mod]), 3)).toBe(0);
    });

    it('suppressed/paralyzed does not apply at range 0', () => {
      expect(total(side([inf]), side([inf], ['suppressed']), 0)).toBe(0);
    });

    it('P-2+ target in hex applies to low-trajectory area fire', () => {
      expect(total(side([mg]), side([inf, vehicle]), 3)).toBe(-2);
    });

    it('P-2+ target in hex does not apply to high-trajectory fire', () => {
      expect(total(side([arty]), side([inf, vehicle]), 3)).toBe(0);
    });
  });

  describe('firer', () => {
    it.each([
      {mod: 'suppressed', expected: -2},
      {mod: 'paralyzed', expected: -2},
      {mod: 'arty', expected: -2},
      {mod: 'smoke', expected: -1},
    ] as const)('$mod: $expected', ({mod, expected}) => {
      expect(total(side([inf], [mod]), side([inf]), 3)).toBe(expected);
    });

    it('smoke does not apply to artillery', () => {
      expect(total(side([arty], ['smoke']), side([inf]), 3)).toBe(0);
    });

    it('cross fire: +4 (marked on target)', () => {
      expect(total(side([inf]), side([inf], ['crossfire']), 3)).toBe(4);
    });
  });

  it('both sides are cumulative', () => {
    expect(total(
      side([inf], ['arty', 'smoke']),
      side([inf], ['arty', 'smoke']),
      3
    )).toBe(-6);
  });

  it('sums all modifiers', () => {
    expect(total(
      side([mg], ['suppressed']),
      side([inf, vehicle], ['night', 'road-moving', 'paralyzed']),
      3
    )).toBe(-2 + 2 - 2 - 2 - 2);
  });

  it('lists applied modifiers with descriptions', () => {
    expect(otherModifiers(
      side([mg], ['suppressed', 'smoke']),
      side([inf, vehicle], ['night', 'crossfire', 'arty']),
      3
    )).toEqual({
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
