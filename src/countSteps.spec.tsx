import {describe, expect, it} from "vitest";
import {countSteps} from "./countSteps.tsx";
import {UnitDef} from "./unitName.tsx";

describe("countSteps", () => {
  it('should add unit steps and subtract loses', () => {
    expect(countSteps({
      units: [
        '4w.40w.2w.2',
        '5w.5b.2w',
        '2w.7b.1w.2',
      ].map(UnitDef.brand),
      mods: [],
      stepLosses: ['3']
    })).toBe(2 + 5 + 2 - 3)
  })
})