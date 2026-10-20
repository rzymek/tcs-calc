import {describe, expect, it} from "vitest";
import {inRange} from "./inRange.ts";

describe('inRange', () => {
  it('range', () => {
    expect(inRange('11..53', 11)).toBe(true);
    expect(inRange('11..53', 53)).toBe(true);
    expect(inRange('11..53', 54)).toBe(false);
  });
  it('single value', () => {
    expect(inRange('66', 66)).toBe(true);
    expect(inRange('66', 65)).toBe(false);
  });
  it('empty or missing definition', () => {
    expect(inRange('', 11)).toBe(false);
    expect(inRange(undefined, 11)).toBe(false);
  });
  it('invalid roll', () => {
    expect(inRange('11..66', NaN)).toBe(false);
  });
});
