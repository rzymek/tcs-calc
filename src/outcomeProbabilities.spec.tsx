import {describe, expect, it} from "vitest";
import * as R from "remeda";
import {distribution} from "./outcomeProbabilities.tsx";
import {fireTable} from "./tcs/firetable.ts";

describe('distribution', () => {
  it('counts outcomes over all 36 rolls', () => {
    expect(distribution(roll => roll < 40 ? 'low' : 'high')).toEqual([
      {label: 'low', p: 0.5},
      {label: 'high', p: 0.5},
    ]);
  });
  it('skips undefined outcomes', () => {
    expect(distribution(roll => roll === 11 ? 'snake eyes' : undefined)).toEqual([
      {label: 'snake eyes', p: 1 / 36},
    ]);
  });
  it('fire table probabilities add up to 1', () => {
    const rows = distribution(roll => fireTable.result({firepower: 12, shift: 0}, roll));
    expect(R.sumBy(rows, it => it.p)).toBeCloseTo(1);
  });
});
