import {describe, it, expect} from 'vitest';
import {targetTerrainPosture} from "./targetTerrainPosture.tsx";
import {UnitDef} from "./unitName.tsx";

const inf = UnitDef.brand('4w.5b.5w');
const pointTarget = UnitDef.brand('1y.7b.2y.1.vehicle');
const vehicle = UnitDef.brand('1y.7b.2b.1.vehicle');

describe('targetTerrainPosture', () => {
  it.each([
    {spotted: false, includesLowTrajectory: true, expected: -7},
    {spotted: false, includesLowTrajectory: false, expected: -4},
    {spotted: true, includesLowTrajectory: true, expected: -4},
    {spotted: true, includesLowTrajectory: false, expected: -4},
  ])('dug in, partly protective, spotted=$spotted, lowTrajectory=$includesLowTrajectory', ({expected, ...ops}) => {
    expect(targetTerrainPosture({
      mods: ['dugin'],
      units: [inf],
      stepLosses: [],
    }, {
      type: 'partly pro',
      name: 'gorse line'
    }, ops)).toEqual(expected);
  });
  it('spotted moving, open', () => {
    expect(targetTerrainPosture({
      mods: ['moving'],
      units: [inf],
      stepLosses: [],
    }, {
      type: 'open',
      name: 'clean'
    }, {
      spotted: true,
      includesLowTrajectory: false,
    })).toEqual(2);
  });
  it('spotted firing, billiard table', () => {
    expect(targetTerrainPosture({
      mods: [],
      units: [inf],
      stepLosses: [],
    }, {
      type: 'billiard table',
      name: 'bridge'
    }, {
      spotted: true,
      includesLowTrajectory: true,
    })).toEqual(2);
  });
  it('mixed postures apply the one least favoring the defender', () => {
    expect(targetTerrainPosture({
      mods: ['dugin', 'moving'],
      units: [inf],
      stepLosses: [],
    }, {
      type: 'open',
      name: 'clean'
    }, {
      spotted: true,
      includesLowTrajectory: false,
    })).toEqual(2);
  });
  it('ignores point targets', () => {
    expect(targetTerrainPosture({
      mods: [],
      units: [pointTarget],
      stepLosses: [],
    }, {
      type: 'open',
      name: 'clean'
    }, {
      spotted: true,
      includesLowTrajectory: false,
    })).toEqual(0);
  });
  it('vehicles on billiard table get +4 when firing', () => {
    expect(targetTerrainPosture({
      mods: ['firing'],
      units: [inf, vehicle],
      stepLosses: [],
    }, {
      type: 'billiard table',
      name: 'bridge'
    }, {
      spotted: true,
      includesLowTrajectory: false,
    })).toEqual(4);
  });
});
