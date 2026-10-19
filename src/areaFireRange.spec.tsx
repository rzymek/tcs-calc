import {describe, expect, it} from "vitest";
import {areaFireRange} from "./areaFireRange.tsx";
import {UnitDef} from "./unitName.tsx";

describe('areaFireRange', () => {
  it('inf sample', () => {
    expect(areaFireRange({
      units: [
        '2w.5b.2w',
        // '3w.10b.5w.2.mg',
      ].map(UnitDef.brand), mods: [], stepLosses: []
    }, 7)).toBe(-3)
  });

  it('mg sample', () => {
    expect(areaFireRange({
      units: [
        // '2w.5b.2w',
        '3w.10b.5w.2.mg',
      ].map(UnitDef.brand), mods: [], stepLosses: []
    }, 7)).toBe(-2)
  });

  it('apply the one that most favors the defender', () => {
    expect(areaFireRange({
      units: [
        '2w.5b.2w',
        '3w.10b.5w.2.mg',
      ].map(UnitDef.brand), mods: [], stepLosses: []
    }, 7)).toBe(-3)
  });
});