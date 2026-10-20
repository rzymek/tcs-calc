import {describe, expect, it} from "vitest";
import {fireResolution, fireTableInput} from "./fireResolution.tsx";
import {initialState, State} from "./state.ts";
import {UnitDef} from "./unitName.tsx";

const inf = UnitDef.brand('4w.5b.5w');        // fire 4, 5 steps
const mg = UnitDef.brand('3w.10b.5w.2.mg');   // fire 3, low trajectory

function stateWith(props: Partial<State>): State {
  return {
    ...initialState,
    attacker: {units: [inf, mg], stepLosses: [], mods: []},
    defender: {units: [inf], stepLosses: [], mods: []},
    ...props,
  };
}

describe('fireResolution', () => {
  it('resolves a spotted fire at range 1', () => {
    expect(fireResolution(stateWith({distance: 1}))).toEqual({
      firepower: 4 + 3,
      infFirepower: 3,
      areaTargetStacking: 0,
      areaFireRange: 2,
      targetTerrainPosture: 0,
      otherModifiers: {modifiers: [], total: 0},
      spottingRange: 3,
      firerInfSteps: 5,
      targetSteps: 5,
      noLOS: false,
      spotted: true,
    });
  });

  it('resolves an unspotted fire at night', () => {
    const fire = fireResolution(stateWith({
      distance: 5,
      defender: {units: [inf], stepLosses: [], mods: ['night']},
    }));
    expect(fire).toMatchObject({
      infFirepower: 0,
      areaFireRange: -2,
      targetTerrainPosture: -2,
      otherModifiers: {total: -2},
      noLOS: true,
      spotted: false,
    });
  });
});

describe('fireTableInput', () => {
  it('sums shifts and adds inf firepower to fire strength', () => {
    expect(fireTableInput(fireResolution(stateWith({distance: 1})))).toEqual({
      shift: 2,
      firepower: 7 + 3,
    });
  });

  it('sums negative shifts', () => {
    const fire = fireResolution(stateWith({
      distance: 5,
      defender: {units: [inf], stepLosses: [], mods: ['night']},
    }));
    expect(fireTableInput(fire)).toEqual({shift: -2 - 2 - 2, firepower: 7});
  });
});
