import {describe, expect, it} from "vitest";
import {morale, moraleTable} from "./morale.ts";
import {inRange} from "../inRange.ts";
import {rolls2d6} from "./dice.ts";

function moraleResult(moraleVal: number, roll: number) {
    return morale(moraleVal, roll).result;
}

describe('morale', () => {
    it('SYR', () => {
        expect(moraleResult(5, 56)).toEqual('SYR');
        expect(moraleResult(-5, 65)).toEqual('SYR');
        expect(moraleResult(1, 65)).toEqual('SYR');
        expect(moraleResult(15, 11)).toEqual('SYR');
        expect(moraleResult(13, 23)).toEqual('SYR');
    })
    it('No Effect', () => {
        expect(moraleResult(8, 11)).toEqual('No Effect');
    });
    it('Surrender', () => {
        expect(moraleResult(7, 66)).toEqual('Surrender');
        expect(moraleResult(13, 42)).toEqual('Surrender');
    });
    it('undefined', () => {
        expect(moraleResult(NaN, 11)).toBeUndefined();
        expect(moraleResult(1, NaN)).toBeUndefined();
    })
    it('clamps the column to 1..13', () => {
        expect(morale(-5, 11).column).toBe(1);
        expect(morale(7, 11).column).toBe(7);
        expect(morale(20, 11).column).toBe(13);
    })
    it('every roll maps to exactly one result in every column', () => {
        for (let column = 1; column <= 13; column++) {
            for (const roll of rolls2d6) {
                const matching = moraleTable.filter(row => inRange(row[column], roll));
                expect(matching.length, `column ${column}, roll ${roll}`).toBe(1);
            }
        }
    })
})
