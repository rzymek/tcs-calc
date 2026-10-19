import {describe, expect, it} from "vitest";
import {infFirepower} from "./infFirepower.tsx";
import {initialState, State} from "./state.ts";
import {UnitDef} from "./unitName.tsx";

function stateWith(distance: number, units: string[], stepLosses: string[] = []): State {
  return {
    ...initialState,
    distance,
    attacker: {
      units: units.map(UnitDef.brand),
      stepLosses,
      mods: [],
    },
  };
}

describe("infFirepower", () => {
  const units = [
    '4w.40w.2w.2',     // inf, 2 steps
    '5w.5b.2w',        // inf, 5 steps
    '14y.9b.0b.2.mg',  // mg, ignored
  ];

  it('should equal infantry steps at distance 0', () => {
    expect(infFirepower(stateWith(0, units))).toBe(2 + 5);
  })
  it('should halve infantry steps, rounding up, at distance 1', () => {
    expect(infFirepower(stateWith(1, units))).toBe(4);
  })
  it('should subtract step losses', () => {
    expect(infFirepower(stateWith(0, units, ['3']))).toBe(2 + 5 - 3);
  })
  it('should be 0 beyond distance 1', () => {
    expect(infFirepower(stateWith(2, units))).toBe(0);
  })
  it('should be 0 with no infantry', () => {
    expect(infFirepower(stateWith(0, ['14y.9b.0b.2.mg']))).toBe(0);
  })
})
