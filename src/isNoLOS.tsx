import {State} from "./state.ts";

export function isNoLOS(state: State, spotted: boolean) {
  const mods = state.defender.mods;
  const night = mods.includes('night');
  const overwatch = mods.includes('firing') || mods.includes('moving');
  const noNightLos = (night && state.distance > 2);
  const noOverwatch = overwatch && !spotted;
  return noNightLos || noOverwatch;
}