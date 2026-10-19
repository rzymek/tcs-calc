import {parseRange, Range} from "./parseRange.tsx";

export function rangeTable<T>(table: Record<string, T>): { range: Range, value: T }[] {
  return Object.entries(table)
    .map(([key, value]) => ({
      range: parseRange(key),
      value,
    }))
}