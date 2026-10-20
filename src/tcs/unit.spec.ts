import {describe, expect, it} from "vitest";
import {remainingSteps, UnitDef, unitName, UnitStats, unitStats} from "./unit.ts";
import {unit} from "./fixtures.ts";

describe('unitName', () => {
  it('strips directory, numeric prefix and extension', () => {
    expect(unitName('./images/units/Arg/00_4w.5b.5w.png')).toEqual('4w.5b.5w');
    expect(unitName('./images/units/Brit/24_6w.40w.0b.3.arty.png')).toEqual('6w.40w.0b.3.arty');
  })
  it('handles names without numeric prefix', () => {
    expect(unitName('./images/steps/1.png')).toEqual('1');
  })
  it('keeps underscores after the prefix', () => {
    expect(unitName('./images/units/Arg/10_a_b.png')).toEqual('a_b');
  })
});

describe('unitStats', () => {
  it('Spt-2', () => {
    expect(unitStats(UnitDef.brand('14y.9b.0b.2.mg'))).toEqual({
      firerType: 'point',
      fireStrength: 14,
      range: 9,
      targetType: 'both',
      steps: 2,
      defenseStrength: 0,
      trajectory: 'low',
      type: 'mg',
    } satisfies UnitStats)
  })
  it('12-D-2', () => {
    expect(unitStats(UnitDef.brand('7w.5b.1w'))).toEqual({
      firerType: 'area',
      fireStrength: 7,
      range: 5,
      trajectory: 'low',
      targetType: 'area',
      steps: 5,
      morale: 1,
      type: 'inf',
    } satisfies UnitStats)
  })
  it('A-GAA 4', () => {
    expect(unitStats(UnitDef.brand('6w.40w.0b.3.arty'))).toEqual({
      firerType: 'area',
      fireStrength: 6,
      range: 40,
      trajectory: 'high',
      targetType: 'both',
      steps: 3,
      defenseStrength: 0,
      type: 'arty'
    } satisfies UnitStats)
  })
  it('defaults to 5 infantry steps', () => {
    expect(unitStats(UnitDef.brand('4w.5b.5w')).steps).toBe(5);
  })
  it.each([
    'abc',
    '4w.5b',
    '4x.5b.5w',
    '4b.5b.5w',
  ])('rejects invalid definition %s', def => {
    expect(() => unitStats(UnitDef.brand(def))).toThrow();
  })
});

describe('remainingSteps', () => {
  it('subtracts the step losses of the unit', () => {
    expect(remainingSteps(unit('4w.5b.5w', 2))).toBe(3);
  });
  it('never drops below zero [10.0e]', () => {
    expect(remainingSteps(unit('4w.5b.5w', 7))).toBe(0);
  });
});
