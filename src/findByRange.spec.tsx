import {describe, expect, it} from "vitest";
import {findByRange} from "./findByRange.tsx";
import {rangeTable} from "./rangeTable.tsx";

describe('findByRange', () => {
  it('should find by range', () => {
    const table = rangeTable({
      "1-2": -3,
      "3-4": -1,
      "5-7": 0,
      "8-9": 1,
      "10-12": 3,
      "13-19": 6,
      "20+": 10,
    });
    expect(findByRange(table, 13)).toBe(6);
    expect(findByRange(table, 73)).toBe(10);
  });
});