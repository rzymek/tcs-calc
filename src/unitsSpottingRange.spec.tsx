import {describe, expect, it} from "vitest";
import {unitSpottingRange, unitsSpottingRange} from "./unitsSpottingRange.tsx";
import {UnitDef} from "./unitName.tsx";

const inf = UnitDef.brand('4w.5b.5w');
const mortar = UnitDef.brand('4w.40w.6w.2.mrt');
const milan = UnitDef.brand('14y.9b.0b.2.milan');
const arty = UnitDef.brand('6w.40w.0b.3.arty');
const aa = UnitDef.brand('4w.12b.0b.1.aa');
const vehicle = UnitDef.brand('1y.7b.2y.1.vehicle');

describe('unitSpottingRange', () => {
  it.each([
    {unit: inf, expected: 3},
    {unit: mortar, expected: 3},
    {unit: milan, expected: 3},
    {unit: arty, expected: 4},
    {unit: aa, expected: 4},
    {unit: vehicle, expected: 8},
  ])('$unit: $expected', ({unit, expected}) => {
    expect(unitSpottingRange(unit)).toBe(expected);
  });
});

describe('unitsSpottingRange', () => {
  it('is unlimited with no units', () => {
    expect(unitsSpottingRange([])).toBe(Infinity);
  });
  it('uses the most visible unit', () => {
    expect(unitsSpottingRange([inf, vehicle, arty])).toBe(8);
  });
});
