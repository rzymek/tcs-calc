import {describe, expect, it} from "vitest";
import {UnitDef, unitName, UnitStats, unitStats} from "./unitName.tsx";

describe('unitName', () => {
  it('strips directory, numeric prefix and extension', () => {
    expect(unitName('./images/units/Arg/00_4w.5b.5w.png')).toEqual('4w.5b.5w');
    expect(unitName('./images/units/Brit/02-2w.7b.1w.png')).toEqual('2w.7b.1w');
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
    expect(unitStats(UnitDef.brand('14y.9b.0b.2w'))).toEqual({
      firerType: 'point',
      fireStrength: 14,
      range: 9,
      targetType: 'both',
      steps: 2,
      defenseStrength: 0,
      trajectory: 'low'
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
      morale: 1
    } satisfies UnitStats)
  })
})