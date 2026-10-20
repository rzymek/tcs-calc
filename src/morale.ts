import {inRange} from "./inRange.ts";

export const moraleTable: string[][] = [
    ['No Effect', '11..53', '11..46', '11..41', '11..33', '11..25', '11..21', '11..14', '11'],
    ['Suppressed', '54..64', '51..64', '42..64', '34..62', '26..54', '22..51', '15..43', '12..34', '11..24', '11..15', '11..13', '11'],
    ['SYR', '65', '65', '65', '63..64', '55..63', '52..61', '44..55', '35..53', '25..46', '16..42', '14..34', '12..31', '11..23'],
    ['Paralyzed', '66', '66', '66', '65..66', '64..66', '62..66', '56..65', '54..64', '51..63', '43..61', '35..53', '32..45', '24..41'],
    ['Surrender', '', '', '', '', '', '', '66', '65..66', '64..66', '62..66', '54..66', '46..66', '42..66'],
] as const;

export function morale(morale: number, roll: number) {
    const normalizedMorale = Math.max(1, Math.min(morale, 13));
    const [result] = moraleTable.find(row => inRange(row[normalizedMorale], roll)) ?? [];
    return {
        result,
        column: normalizedMorale,
    };
}