import {describe, expect, it} from "vitest";
import {fireTable, firetable, rawColumns} from "./firetable.ts";
import {inRange} from "./inRange.ts";

describe('firetable', () => {
    it.skip('csv', async () => {
        const csvValue = (v: any) => `"${v}"`;
        const csvSeparator = ",";
        const csv = [
            ['Effect', ...rawColumns].map(csvValue).join(csvSeparator),
            ...firetable.map(row => row.map(csvValue).join(csvSeparator)),
        ].join('\n');
        const fs = await import("fs/promises" as string);
        await fs.writeFile("dist/firetable.csv", csv)
    })
    it('column', () => {
        expect(fireTable.column({firepower: 0, shift: 0}).label).toBe('0')
        expect(fireTable.column({firepower: 1, shift: 0}).label).toBe('1')
        expect(fireTable.column({firepower: 7, shift: 0}).label).toBe('7-8')
        expect(fireTable.column({firepower: 8, shift: 0}).label).toBe('7-8')
        expect(fireTable.column({firepower: 8, shift: 1}).label).toBe('9-10')
        expect(fireTable.column({firepower: 8, shift: 2}).label).toBe('11-13')
        expect(fireTable.column({firepower: 9, shift: 0}).label).toBe('9-10')
        expect(fireTable.column({firepower: 81, shift: 0}).label).toBe('81-100')
        expect(fireTable.column({firepower: 90, shift: 0}).label).toBe('81-100')
        expect(fireTable.column({firepower: 100, shift: 0}).label).toBe('81-100')
        expect(fireTable.column({firepower: 100, shift: 2}).label).toBe('101+')
        expect(fireTable.column({firepower: 100, shift: 5}).label).toBe('101+')
        expect(fireTable.column({firepower: 101, shift: 0}).label).toBe('101+')
        expect(fireTable.column({firepower: 200, shift: 0}).label).toBe('101+')
    })
    it('column shifted off the left side', () => {
        expect(fireTable.column({firepower: 2, shift: -2})).toEqual({index: 0, label: '0'})
        expect(fireTable.column({firepower: 2, shift: -3})).toEqual({index: -1, label: 'left of 0'})
        expect(fireTable.column({firepower: 2, shift: -5})).toEqual({index: -1, label: 'left of 0'})
    })
    it('shifted off the left side has no effect', () => {
        expect(fireTable.result({firepower: 2, shift: -5}, 11)).toBe('No Effect');
        expect(fireTable.result({firepower: 2, shift: -5}, 66)).toBe('No Effect');
    })
    it('roll', () => {
        expect(fireTable.result({firepower: 12, shift: 0}, 51)).toBe('-1 step');
    })
    it('results at column 0', () => {
        expect(fireTable.result({firepower: 0, shift: 0}, 53)).toBe('No Effect');
        expect(fireTable.result({firepower: 0, shift: 0}, 54)).toBe('Morale Check');
        expect(fireTable.result({firepower: 0, shift: 0}, 66)).toBe('-1 step');
    })
    it('results at the rightmost column', () => {
        expect(fireTable.result({firepower: 101, shift: 0}, 11)).toBe('-2 steps');
        expect(fireTable.result({firepower: 101, shift: 0}, 23)).toBe('-3 steps');
        expect(fireTable.result({firepower: 101, shift: 0}, 66)).toBe('-9 steps');
    })
    it('every roll maps to exactly one result in every column', () => {
        const rolls = [1, 2, 3, 4, 5, 6].flatMap(tens => [1, 2, 3, 4, 5, 6].map(units => tens * 10 + units));
        rawColumns.forEach((column, idx) => {
            rolls.forEach(roll => {
                const matching = firetable.filter(([, ...cells]) => inRange(cells[idx], roll));
                // empty cells at the low end of a column mean No Effect
                expect(matching.length, `column ${column}, roll ${roll}`).toBeLessThanOrEqual(1);
            });
        });
    })
})