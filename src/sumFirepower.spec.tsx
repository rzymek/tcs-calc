import {describe, expect, it} from "vitest";
import {sumFirepower} from "./sumFirepower.tsx";
import {SideState} from "./state.ts";
import {UnitDef} from "./unitName.tsx";

function sideWith(units: string[]): SideState {
  return {
    units: units.map(UnitDef.brand),
    stepLosses: [],
    mods: [],
  };
}

describe("sumFirepower", () => {
  it('should be 0 with no units', () => {
    expect(sumFirepower(sideWith([]))).toBe(0);
  })
  it('should sum area fire strength of all firers', () => {
    expect(sumFirepower(sideWith([
      '7w.5b.1w',         // inf, 7
      '3w.10b.5w.2.mg',   // mg, 3
    ]))).toBe(7 + 3);
  })
  it('should ignore point firers', () => {
    expect(sumFirepower(sideWith([
      '7w.5b.1w',         // inf, 7
      '14y.9b.0b.2.mg',   // point, ignored
    ]))).toBe(7);
  })
})
