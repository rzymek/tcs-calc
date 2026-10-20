import {describe, expect, it} from "vitest";
import {areaFireRange, rowOf} from "./areaFireRange.tsx";
import {UnitDef, unitStats} from "./unitName.tsx";

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

  it('ignores point firers', () => {
    expect(areaFireRange({
      units: ['14y.9b.0b.2.milan'].map(UnitDef.brand), mods: [], stepLosses: []
    }, 7)).toBe(0)
  });

  it('mortars have no range modifier', () => {
    expect(areaFireRange({
      units: ['4w.40w.6w.2.mrt'].map(UnitDef.brand), mods: [], stepLosses: []
    }, 0)).toBe(0)
  });
});

describe('rowOf', () => {
  it.each([
    {unit: '4w.5b.5w', expected: 'inf'},
    {unit: '4w.40w.6w.2.mrt', expected: 'mrt'},
    {unit: '3w.10b.5w.2.mg', expected: 'low'},
    {unit: '6w.40w.0b.3.arty', expected: 'high'},
  ])('$unit: $expected', ({unit, expected}) => {
    expect(rowOf(unitStats(UnitDef.brand(unit)))).toBe(expected);
  });
});