import {describe, expect, it} from "vitest";
import {unitName, unitStats, UnitStats} from "../../tcs/unit.ts";

const files = Object.keys(import.meta.glob(['./Arg/*.png', './Brit/*.png']));

type KeysOfUnion<T> = T extends unknown ? keyof T : never;
type ValueOfUnion<T, K extends PropertyKey> = T extends unknown ? (K extends keyof T ? T[K] : never) : never;
type UnitStatsValues = { [K in KeysOfUnion<UnitStats>]: ValueOfUnion<UnitStats, K>[] };

function valuesByField(paths: string[]): UnitStatsValues {
  const grouped: Record<string, Set<unknown>> = {};
  for (const path of paths) {
    for (const [field, value] of Object.entries(unitStats(unitName(path)))) {
      (grouped[field] ??= new Set()).add(value);
    }
  }
  return Object.fromEntries(
    Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([field, values]) => [field, [...values].sort((a, b) => String(a).localeCompare(String(b), undefined, {numeric: true}))])
  ) as UnitStatsValues;
}

function expectNumbers(values: UnitStatsValues, field: keyof UnitStatsValues) {
  values[field].every(v => {
    expect(v, field).toBeTypeOf('number');
    expect(v, field).toBeGreaterThanOrEqual(0)
    expect(v, field).toBeLessThanOrEqual(99)
  });
}

describe('units', () => {
  it('finds unit images', () => {
    expect(files.length).toBeGreaterThan(0);
  });
  it('unitStats values by field', () => {
    const values = valuesByField(files);
    expectNumbers(values, 'defenseStrength');
    expectNumbers(values, 'fireStrength');
    expectNumbers(values, 'morale');
    expectNumbers(values, 'range');
    expectNumbers(values, 'steps');
    expect(values.firerType).toMatchInlineSnapshot(`
      [
        "area",
        "point",
      ]
    `)
    expect(values.targetType).toMatchInlineSnapshot(`
      [
        "area",
        "both",
        "point",
      ]
    `)
    expect(values.trajectory).toMatchInlineSnapshot(`
      [
        "high",
        "low",
      ]
    `)
    expect(values.type).toMatchInlineSnapshot(`
      [
        "aa",
        "arty",
        "at",
        "inf",
        "mg",
        "milan",
        "mrt",
        "vehicle",
        "wt",
      ]
    `)
  });
});
