import {describe, expect, it} from "vitest";
import {isNoLOS} from "./los.ts";
import {Modifier} from "./state.ts";
import {fireState, side} from "./fixtures.ts";

describe('isNoLOS', () => {
  it.each([
    {mods: [], distance: 10, spotted: false, expected: false},
    {mods: ['night'], distance: 2, spotted: true, expected: false},
    {mods: ['night'], distance: 3, spotted: true, expected: true},
    {mods: ['night', 'illum'], distance: 10, spotted: true, expected: false},
    {mods: ['firing'], distance: 3, spotted: true, expected: false},
    {mods: ['firing'], distance: 3, spotted: false, expected: true},
    {mods: ['moving'], distance: 3, spotted: false, expected: true},
  ] as { mods: Modifier[], distance: number, spotted: boolean, expected: boolean }[])(
    'target mods=$mods, distance=$distance, spotted=$spotted: $expected',
    ({mods, distance, spotted, expected}) => {
      expect(isNoLOS(fireState({distance, defender: side([], mods)}), spotted)).toBe(expected);
    });
});
