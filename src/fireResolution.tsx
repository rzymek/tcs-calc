import {State} from "./state.ts";
import {unitStats} from "./unitName.tsx";
import {countSteps} from "./countSteps.tsx";
import {infFirepower} from "./infFirepower.tsx";
import {areaTargetStacking} from "./areaTargetStacking.tsx";
import {unitsSpottingRange} from "./unitsSpottingRange.tsx";
import {areaFireRange} from "./areaFireRange.tsx";
import {targetTerrainPosture} from "./targetTerrainPosture.tsx";
import {otherModifiers} from "./otherModifiers.tsx";
import {isNoLOS} from "./isNoLOS.tsx";
import {includesLowTrajectory} from "./includesLowTrajectory.tsx";
import {sumFirepower} from "./sumFirepower.tsx";
import * as R from "remeda";

export function fireResolution(state: State) {
  const spottingRange = unitsSpottingRange(state.defender.units);
  const spotted = state.distance <= spottingRange;

  return {
    firepower: sumFirepower(state.attacker),
    infFirepower: infFirepower(state),
    areaTargetStacking: areaTargetStacking(state, spotted),
    areaFireRange: areaFireRange(state.attacker, state.distance),
    targetTerrainPosture: targetTerrainPosture(state.defender, state.terrain, {
      spotted: spotted,
      includesLowTrajectory: includesLowTrajectory(state)
    }),
    otherModifiers: otherModifiers(state.attacker, state.defender, state.distance),
    spottingRange,
    firerInfSteps: countSteps({
      ...state.attacker,
      units: state.attacker.units.filter(unit => unitStats(unit).type === 'inf'),
    }),
    targetSteps: countSteps(state.defender),
    noLOS: isNoLOS(state, spotted),
    spotted,
  }
}

export function fireTableInput(fire: ReturnType<typeof fireResolution>) {
  const shift = R.pipe([
    fire.areaTargetStacking,
    fire.areaFireRange,
    fire.targetTerrainPosture,
    fire.otherModifiers.total
  ], R.sum());
  const firepower = fire.firepower + fire.infFirepower;
  return {shift, firepower}
}