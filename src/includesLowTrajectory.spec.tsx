import {describe, expect, it} from "vitest";
import {includesLowTrajectory} from "./includesLowTrajectory.tsx";
import {initialState} from "./state.ts";
import {UnitDef} from "./unitName.tsx";

const mg = UnitDef.brand('3w.10b.5w.2.mg');       // low trajectory
const mortar = UnitDef.brand('4w.40w.6w.2.mrt');  // high trajectory

function attackers(...units: UnitDef[]) {
  return {...initialState, attacker: {units, stepLosses: [], mods: []}};
}

describe('includesLowTrajectory', () => {
  it('no firers', () => {
    expect(includesLowTrajectory(attackers())).toBe(false);
  });
  it('low trajectory firer', () => {
    expect(includesLowTrajectory(attackers(mg))).toBe(true);
  });
  it('high trajectory firer', () => {
    expect(includesLowTrajectory(attackers(mortar))).toBe(false);
  });
  it('mixed', () => {
    expect(includesLowTrajectory(attackers(mortar, mg))).toBe(true);
  });
});
