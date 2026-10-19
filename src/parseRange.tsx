export interface Range {
  from: number,
  to: number
}

export function parseRange(rangeDef: string): Range {
  const def = rangeDef.trim();
  if (def.endsWith('+')) {
    return {from: Number(def.slice(0, -1)), to: Infinity};
  }
  const [from, to = from] = def.split('-').map(Number) as number[];
  return {from, to};
}