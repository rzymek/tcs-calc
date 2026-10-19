import {describe, expect, it} from "vitest";
import {rangeTable} from "./rangeTable.tsx";

describe('rangeTable', () => {
  it('parses keys into ranges', () => {
    expect(rangeTable({
      '1-2': -1,
      '3-5': 0,
      '6+': 1,
    })).toEqual([
      {range: {from: 1, to: 2}, value: -1},
      {range: {from: 3, to: 5}, value: 0},
      {range: {from: 6, to: Infinity}, value: 1},
    ])
  })
  it('empty table', () => {
    expect(rangeTable({})).toEqual([])
  })
})
