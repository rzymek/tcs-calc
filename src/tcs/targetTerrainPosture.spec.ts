import {describe, expect, it} from 'vitest';
import {postures, targetTerrainPosture} from "./targetTerrainPosture.ts";
import {Modifier, Terrain} from "./state.ts";
import {UnitDef, unitStats} from "./unit.ts";
import {inf} from "./fixtures.ts";

const infStats = unitStats(UnitDef.brand(inf));
const vehicle = unitStats(UnitDef.brand('1y.7b.2b.1.vehicle'));
const open: Terrain = {type: 'open', name: 'clean'};

describe('targetTerrainPosture', () => {
  it.each([
    {unspotted: true, expected: -7},
    {unspotted: false, expected: -4},
  ])('dug in, partly protective, unspotted=$unspotted', ({unspotted, expected}) => {
    expect(targetTerrainPosture([infStats], {mods: ['dugin']}, {type: 'partly pro', name: 'gorse line'}, unspotted))
      .toEqual(expected);
  });
  it('spotted moving, open', () => {
    expect(targetTerrainPosture([infStats], {mods: ['moving']}, open, false)).toEqual(2);
  });
  it('spotted firing, billiard table', () => {
    expect(targetTerrainPosture([infStats], {mods: []}, {type: 'billiard table', name: 'bridge'}, false)).toEqual(2);
  });
  it('mixed postures apply the one least favoring the defender', () => {
    expect(targetTerrainPosture([infStats], {mods: ['dugin', 'moving']}, open, false)).toEqual(2);
  });
  it('no targets', () => {
    expect(targetTerrainPosture([], {mods: []}, open, false)).toEqual(0);
  });
  it('vehicles on billiard table get +4 when firing', () => {
    expect(targetTerrainPosture([infStats, vehicle], {mods: ['firing']}, {type: 'billiard table', name: 'bridge'}, false))
      .toEqual(4);
  });
  it('unknown terrain type', () => {
    expect(targetTerrainPosture([infStats], {mods: []}, {type: 'swamp', name: 'x'}, false)).toEqual(0);
  });
});

describe('postures', () => {
  it.each([
    {mods: [], expected: ['fire']},
    {mods: ['firing'], expected: ['fire']},
    {mods: ['dugin'], expected: ['dugin']},
    {mods: ['moving'], expected: ['moving']},
    {mods: ['dugin', 'firing'], expected: ['dugin', 'fire']},
    {mods: ['moving', 'dugin'], expected: ['dugin', 'moving']},
    {mods: ['night'], expected: ['fire']},
  ] as { mods: Modifier[], expected: string[] }[])('$mods: $expected', ({mods, expected}) => {
    expect(postures({mods})).toEqual(expected);
  });
});
