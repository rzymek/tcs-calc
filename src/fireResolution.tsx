import {State} from "./state.ts";
import {unitStats} from "./unitName.tsx";
import {countSteps} from "./countSteps.tsx";
import {infFirepower} from "./infFirepower.tsx";
import {areaTargetStacking, includesLowTrajectory} from "./areaTargetStacking.tsx";
import {unitsSpottingRange} from "./unitsSpottingRange.tsx";
import {areaFireRange} from "./areaFireRange.tsx";
import {targetTerrainPosture} from "./targetTerrainPosture.tsx";

export function fireResolution(state: State) {
  const spottingRange = unitsSpottingRange(state.defender.units);
  const spotted = state.distance <= spottingRange;

  return {
    infFirepower: infFirepower(state),
    areaTargetStacking: areaTargetStacking(state, spotted),
    areaFireRange: areaFireRange(state.attacker, state.distance),
    targetTerrainPosture: targetTerrainPosture(state.defender, state.terrain, {
      spotted: spotted,
      includesLowTrajectory: includesLowTrajectory(state)
    }),
    spottingRange,
    firerInfSteps: countSteps({
      ...state.attacker,
      units: state.attacker.units.filter(unit => unitStats(unit).type === 'inf'),
    }),
    targetSteps: countSteps(state.defender),
    spotted,
  }
}