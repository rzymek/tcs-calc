import {describe, expect, it} from "vitest";
import {parseRange} from "./parseRange.tsx";

describe('parseRange', () => {
  it('a-b', () => {
    expect(parseRange('3-5')).toEqual({from: 3, to: 5})
  })
  it('a+', () => {
    expect(parseRange('20+')).toEqual({from: 20, to: Infinity})
  })
  it('single value', () => {
    expect(parseRange('5')).toEqual({from: 5, to: 5})
  })
})