import {SideState, State} from "./state.ts";
import {rangeTable} from "./rangeTable.tsx";
import {findByRange} from "./findByRange.tsx";

interface AreaFireRangeColumn {
  inf: number,
  low: number,
  high: number,
  mrt: number,
}
const areaFireRangeTable = rangeTable({
  '0': {inf: +4, low: +4, high: +4, mrt: 0},
  '1': {inf: +2, low: +2, high: +2, mrt: 0},
  '2': {inf: +1, low: +1, high: +1, mrt: 0},
  '3': {inf: 0, low: 0, high: 0, mrt: 0},
  '4': {inf: -1, low: 0, high: 0, mrt: 0},
  '5': {inf: -2, low: -1, high: 0, mrt: 0},
  '6-8': {inf: -3, low: -2, high: 0, mrt: 0},
  '9+': {inf: -6, low: -3, high: 0, mrt: 0},
} satisfies Record<string, AreaFireRangeColumn>)

/*
11.3c Range. Find the range modifier
for each firing unit on the Area Fire Range
Modifier Table and apply the one that most
favors the defender.
The row for Low-Trajectory covers all
Low-Trajectory firers except Infantry.
 */
export function areaFireRange(state: SideState, distance:number) {
  const column = findByRange(areaFireRangeTable, distance);
  return 0;
}