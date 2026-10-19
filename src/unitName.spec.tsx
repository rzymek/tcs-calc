import {describe, expect, it} from "vitest";
import {unitName} from "./unitName.tsx";

describe('unitName', () => {
  it('strips directory, numeric prefix and extension', () => {
    expect(unitName('./images/units/Arg/00_4w.5b.5w.png')).toEqual('4w.5b.5w');
    expect(unitName('./images/units/Brit/02_2w.7b.1w.png')).toEqual('2w.7b.1w');
  })
  it('handles names without numeric prefix', () => {
    expect(unitName('./images/steps/1.png')).toEqual('1');
  })
  it('keeps underscores after the prefix', () => {
    expect(unitName('./images/units/Arg/10_a_b.png')).toEqual('a_b');
  })
});
