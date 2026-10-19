import {Range} from "./parseRange.tsx";

export function findByRange<T>(ranges: { range: Range, value: T }[], number: number): T {
  const entry = ranges.find(({range}) => range.from <= number && number <= range.to);
  if (entry === undefined) {
    throw new Error(`No range found for ${number}`);
  }
  return entry.value;
}