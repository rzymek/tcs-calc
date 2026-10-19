import {State} from "./state.ts";
import {UnitDef} from "./unitName.tsx";

function spottingRange(state: State): number {
  return 0;
}

function areaTarget(units: UnitDef[]) {

}

export function fireResolution(state: State) {
  const spotRange = spottingRange(state);
  const aTarget = areaTarget(state.defender.units);
  return {
    spotted: false,
  }
}