import {describe, expect, it} from "vitest";
import {isNoLOS} from "./isNoLOS.tsx";
import {initialState, State} from "./state.ts";
import {Modifier} from "./modifiers.tsx";

function stateWith(distance: number, mods: Modifier[]): State {
  return {...initialState, distance, defender: {...initialState.defender, mods}};
}

describe('isNoLOS', () => {
  it.each([
    {mods: [], distance: 10, spotted: false, expected: false},
    {mods: ['night'], distance: 2, spotted: true, expected: false},
    {mods: ['night'], distance: 3, spotted: true, expected: true},
    {mods: ['firing'], distance: 3, spotted: true, expected: false},
    {mods: ['firing'], distance: 3, spotted: false, expected: true},
    {mods: ['moving'], distance: 3, spotted: false, expected: true},
  ] as { mods: Modifier[], distance: number, spotted: boolean, expected: boolean }[])(
    'mods=$mods, distance=$distance, spotted=$spotted: $expected',
    ({mods, distance, spotted, expected}) => {
      expect(isNoLOS(stateWith(distance, mods), spotted)).toBe(expected);
    });
});
