import {describe, expect, it} from "vitest";
import {
  areaFirepower,
  areaFireRange,
  areaTargets,
  areaTargetStacking,
  includesLowTrajectory,
  infFirepower,
  rowOf
} from "./areaFire.ts";
import {counter, UnitDef, UnitState, unitStats} from "./unit.ts";
import {tcsRules} from "./gameRules.ts";
import {arty, atGun, goodInf, inf, mg, milan, mortar, side, unit, vehicle} from "./fixtures.ts";

const counters = (...units: (string | UnitState)[]) => units.map(it => counter(typeof it === 'string' ? unit(it) : it));
const stats = (...defs: string[]) => defs.map(def => unitStats(UnitDef.brand(def)));

describe('areaFirepower', () => {
  it('is 0 with no firers', () => {
    expect(areaFirepower([], tcsRules)).toBe(0);
  });
  it('sums Fire strengths', () => {
    expect(areaFirepower(counters(goodInf, mg), tcsRules)).toBe(7 + 3);
  });
  it('P-firers combine with A-firers [11.1d]', () => {
    expect(areaFirepower(counters(inf, vehicle), tcsRules)).toBe(4 + 1);
  });
  it('multi-step guns fire with steps x Fire rating [11.1f, 24.6b]', () => {
    expect(areaFirepower(counters(arty), tcsRules)).toBe(3 * 6);
    expect(areaFirepower(counters(unit(arty, 1)), tcsRules)).toBe(2 * 6);
  });
  it('AT guns fire at half strength [9.1f]', () => {
    expect(areaFirepower(counters(atGun), tcsRules)).toBe(2 * 5 / 2);
  });
  it('rounds the total', () => {
    expect(areaFirepower(counters(inf, '5y.10b.0b.1.at'), tcsRules)).toBe(7);
  });
  it('Infantry and Mortars fire with their printed strength', () => {
    expect(areaFirepower(counters(unit(inf, 3), unit(mortar, 1)), tcsRules)).toBe(4 + 4);
  });
});

describe('infFirepower', () => {
  const firers = counters(unit(inf, 1), '5w.5b.2w', unit(mg, 1));
  it('adds Infantry steps at range 0', () => {
    expect(infFirepower(firers, 0)).toBe(4 + 5);
  });
  it('adds half of Infantry steps, rounding normally, at range 1', () => {
    expect(infFirepower(firers, 1)).toBe(5);
  });
  it('is 0 beyond range 1', () => {
    expect(infFirepower(firers, 2)).toBe(0);
  });
  it('is 0 with no infantry', () => {
    expect(infFirepower(counters(mg), 0)).toBe(0);
  });
});

describe('areaFireRange', () => {
  it('inf', () => {
    expect(areaFireRange(stats('2w.5b.2w'), 7)).toBe(-3);
  });
  it('low trajectory', () => {
    expect(areaFireRange(stats(mg), 7)).toBe(-2);
  });
  it('apply the one that most favors the defender', () => {
    expect(areaFireRange(stats('2w.5b.2w', mg), 7)).toBe(-3);
  });
  it('P-firers use the Low-Trajectory row', () => {
    expect(areaFireRange(stats(atGun), 5)).toBe(-1);
  });
  it('mortars have no range modifier', () => {
    expect(areaFireRange(stats(mortar), 0)).toBe(0);
  });
  it('no firers', () => {
    expect(areaFireRange([], 3)).toBe(0);
  });
});

describe('rowOf', () => {
  it.each([
    {def: inf, expected: 'inf'},
    {def: mortar, expected: 'mrt'},
    {def: mg, expected: 'low'},
    {def: arty, expected: 'high'},
  ])('$def: $expected', ({def, expected}) => {
    expect(rowOf(unitStats(UnitDef.brand(def)))).toBe(expected);
  });
});

describe('includesLowTrajectory', () => {
  it.each([
    {firers: [], expected: false},
    {firers: [mg], expected: true},
    {firers: [mortar], expected: false},
    {firers: [mortar, mg], expected: true},
    {firers: [milan], expected: true},
  ])('$firers: $expected', ({firers, expected}) => {
    expect(includesLowTrajectory(stats(...firers))).toBe(expected);
  });
});

describe('areaTargets', () => {
  const b1 = '2y.7b.1b.2.carrier';
  const targetDefs = (defender: (string | UnitState)[], firers: string[]) =>
    areaTargets(side(defender), stats(...firers)).map(it => it.unit.def);

  it('excludes Point targets [11.1a]', () => {
    expect(targetDefs([inf, vehicle, atGun], [mg])).toEqual([inf, atGun]);
  });
  it('excludes B-1 targets if any firer is Infantry [11.1b]', () => {
    expect(targetDefs([inf, b1], [inf, mg])).toEqual([inf]);
    expect(targetDefs([inf, b1], [mg])).toEqual([inf, b1]);
  });
  it('excludes eliminated units', () => {
    expect(targetDefs([unit(inf, 5), mg], [mg])).toEqual([mg]);
  });
});

describe('areaTargetStacking', () => {
  const spotted = {spotted: true, lowTrajectory: true};
  it('is 0 with no target steps', () => {
    expect(areaTargetStacking(0, spotted)).toBe(0);
  });
  it.each([
    {steps: 5, expected: 0},
    {steps: 8, expected: 1},
    {steps: 10, expected: 3},
    {steps: 15, expected: 6},
    {steps: 20, expected: 10},
  ])('$steps steps: $expected', ({steps, expected}) => {
    expect(areaTargetStacking(steps, spotted)).toBe(expected);
  });
  describe('negative modifiers', () => {
    it('do not apply to spotted fire', () => {
      expect(areaTargetStacking(1, spotted)).toBe(0);
    });
    it('apply to unspotted fire including low-trajectory firers', () => {
      expect(areaTargetStacking(1, {spotted: false, lowTrajectory: true})).toBe(-3);
      expect(areaTargetStacking(3, {spotted: false, lowTrajectory: true})).toBe(-1);
    });
    it('do not apply to unspotted high-trajectory only fire', () => {
      expect(areaTargetStacking(1, {spotted: false, lowTrajectory: false})).toBe(0);
    });
  });
});
