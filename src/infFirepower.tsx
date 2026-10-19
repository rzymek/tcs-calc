import {State} from "./state.ts";
import {countSteps} from "./countSteps.tsx";
import {unitStats} from "./unitName.tsx";
import {assertNever} from "./assertNever.tsx";

export function infFirepower(state: State) {
  if (state.distance > 1 || state.distance < 0) {
    return 0;
  }
  const infSteps = countSteps({
    ...state.attacker,
    units: state.attacker.units.filter(unit => unitStats(unit).type === 'inf'),
  });
  if (state.distance === 0) {
    return infSteps;
  }
  if (state.distance === 1) {
    return Math.round(infSteps / 2);
  }
  assertNever(state.distance);
}