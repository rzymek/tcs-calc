import {describe, expect, it} from "vitest";
import {differential, differentialRow, pointFireRange, pointTargets} from "./pointFire.ts";
import {pointFireRangeCategory, tcsRules} from "./gameRules.ts";
import {UnitDef, unitStats} from "./unit.ts";
import {atGun, fireState, inf, side, unit, vehicle} from "./fixtures.ts";

const stats = (...defs: string[]) => defs.map(def => unitStats(UnitDef.brand(def)));

describe('pointFireRangeCategory', () => {
  // 12.1b for a unit with a printed range of 7, Close is 0–4, Nominal 5–7, and Long 8–14
  it.each([
    {distance: 0, expected: 'close'},
    {distance: 4, expected: 'close'},
    {distance: 5, expected: 'nominal'},
    {distance: 7, expected: 'nominal'},
    {distance: 8, expected: 'long'},
    {distance: 14, expected: 'long'},
    {distance: 15, expected: undefined},
  ])('range 7, distance $distance: $expected', ({distance, expected}) => {
    expect(pointFireRangeCategory(7, distance)).toBe(expected);
  });
});

describe('pointFireRange', () => {
  it('applies the modifier that favors the defender most', () => {
    // close for the AT gun (range 10), nominal for the vehicle (range 7)
    expect(pointFireRange(stats(atGun, vehicle), 5, tcsRules)).toBe(3);
    expect(pointFireRange(stats(atGun), 5, tcsRules)).toBe(5);
    expect(pointFireRange(stats(vehicle), 8, tcsRules)).toBe(0);
  });
});

describe('differential', () => {
  it('lowest P-Fire strength minus best P-defense', () => {
    expect(differential(stats('5y.7b.4y.1.vehicle', '3y.7b.3y.1.vehicle'), stats(vehicle, atGun))).toEqual({
      firerStrength: 3,
      targetDefense: 2,
      value: 1,
      shift: 1,
    });
  });
  it.each([
    {value: 5, shift: 3},
    {value: 3, shift: 3},
    {value: 0, shift: 0},
    {value: -1, shift: -2},
    {value: -2, shift: -4},
    {value: -3, shift: -8},
    {value: -4, shift: -12},
    {value: -5, shift: undefined},
    {value: -9, shift: undefined},
  ])('differential $value: $shift', ({value, shift}) => {
    const firer = `${value + 10}y.7b.1y.1.vehicle`;
    expect(differential(stats(firer), stats('1y.7b.10y.1.vehicle')).shift).toBe(shift);
  });
  it('rows', () => {
    expect(differentialRow(7)).toBe(0);
    expect(differentialRow(0)).toBe(3);
    expect(differentialRow(-7)).toBe(8);
  });
});

describe('pointTargets', () => {
  it('Point targets and B-targets only', () => {
    const targets = pointTargets(fireState({defender: side([inf, vehicle, atGun, unit(vehicle, 1)])}), tcsRules);
    expect(targets.map(it => it.unit.def)).toEqual([vehicle, atGun]);
  });
});
