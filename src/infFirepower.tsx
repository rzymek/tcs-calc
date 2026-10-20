import {SideState, State} from "./state.ts";
import {countSteps} from "./countSteps.tsx";
import {unitStats} from "./unitName.tsx";
import {assertNever} from "./assertNever.tsx";

export function infSteps(side: SideState) {
  return countSteps({
    ...side,
    units: side.units.filter(unit => unitStats(unit).type === 'inf'),
  });
}

export function infFirepower(state: State) {
  if (state.distance > 1 || state.distance < 0) {
    return 0;
  }
  const steps = infSteps(state.attacker);
  if (state.distance === 0) {
    return steps;
  }
  if (state.distance === 1) {
    return Math.round(steps / 2);
  }
  assertNever(state.distance);
}