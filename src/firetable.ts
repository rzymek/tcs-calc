import {isString} from "remeda";
import {inRange} from "./inRange.ts";
import {State} from "./state.ts";

export const rawColumns = [
  0, 1, 2, 3, 4, 5, 6, '7-8', '9-10', '11-13', '14-16', '17-20', '21-25', '26-32', '33-40', '41-50', '51-64', '65-80', '81-100', '101+'
] as const;
export const pColumns = [
  [1, 4],
  [2, '7-8'],
  [3, '11-13'],
  [4, '14-16'],
  [5, '17-20'],
  [6, '21-25'],
  ['7-8', '26-32'],
  ['9-10', '33-40'],
  ['11-12', '41-50'],
  ['13-16', '51-64'],
  ['17-20', '65-80'],
  ['21-25', '81-100'],
  ['26+', '101+'],
] as const;

export const firetable = [
  ['No Effect', '11..53', '11..51', '11..45', '11..43', '11..41', '11..35', '11..33', '11..26', '11..24', '11..22', '11..16', '11..14', '11..12'],
  ['Morale Check', '54..65', '52..63', '46..62', '44..61', '42..56', '36..54', '34..53', '31..51', '25..51', '23..45', '21..41', '15..35', '13..26', '11..23', '11..16', '11..14', '11..13'],
  ['-1 step', '66', '64..66', '63..66', '62..66', '61..66', '55..66', '54..65', '52..65', '52..64', '46..64', '42..62', '36..56', '31..54', '24..52', '21..45', '15..36', '14..35', '11..26', '11..23'],
  ['-2 steps', '', '', '', '', '', '', '66', '66', '65', '65', '63..64', '61..63', '55..61', '53..56', '46..53', '41..46', '36..45', '31..36', '24..33', '11..22'],
  ['-3 steps', '', '', '', '', '', '', '', '', '66', '66', '65..66', '64..65', '62..64', '61..63', '54..61', '51..56', '46..54', '41..46', '34..43', '23..33'],
  ['-4 steps', '', '', '', '', '', '', '', '', '', '', '', '66', '65', '64', '62..63', '61..63', '55..61', '51..54', '44..52', '34..43'],
  ['-5 steps', '', '', '', '', '', '', '', '', '', '', '', '', '66', '65', '64', '64', '62..63', '55..62', '53..55', '44..52'],
  ['-6 steps', '', '', '', '', '', '', '', '', '', '', '', '', '', '66', '65', '65', '64', '63..64', '56..62', '53..56'],
  ['-7 steps', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '66', '66', '65', '65', '63..64', '61..63'],
  ['-8 steps', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '66', '66', '65', '64..65'],
  ['-9 steps', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '66', '66'],
] as const;

function isInRangePredicate(v: number) {
  return (range: number | string) => {
    if (range === v) {
      return true;
    } else if (isString(range)) {
      const [from, to = Infinity] = range.split(/[-+]/)
        .filter(v => v !== '')
        .map(it => Number(it));
      return from <= v && v <= to;
    } else {
      return false;
    }
  };
}
export type FiretableInput = { shift: number } & ({ firepower: number } | { pSteps: number });
export const fireTable = {
  column(resolution: FiretableInput) {
    const colIndex = 'firepower' in resolution
      ? areaColumn(resolution.firepower)
      : pColumn(resolution.pSteps);
    return effectiveColumn(colIndex, resolution.shift);
  },
  result(resolution: FiretableInput, roll: number) {
    const col = this.column(resolution);
    const row = firetable.find(([, ...rols]) => inRange(rols[col.index], roll)) ?? firetable[0]
    return row[0];
  },
}

function areaColumn(firepower: number) {
  return rawColumns.findIndex(isInRangePredicate(firepower));
}

function pColumn(firerSteps: number) {
  const inRangePredicate = isInRangePredicate(firerSteps ?? NaN);
  const [, aColumn] = pColumns.find(([pFireSteps]) => inRangePredicate(pFireSteps)) ?? [0, 0]
  return rawColumns.indexOf(aColumn);
}

function effectiveColumn(index: number, shift: number) {
  const effectiveIndex = Math.min(index + shift, rawColumns.length - 1)
  return {
    index: effectiveIndex,
    label: String(rawColumns[effectiveIndex])
  }
}

export type FireResolutionResult = ReturnType<typeof fireTable["result"]>
