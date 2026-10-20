import {UnitState} from "./unit.ts";

export type Modifier =
  | 'night' | 'twilight' | 'illum'
  | 'suppressed' | 'paralyzed'
  | 'smoke' | 'arty' | 'dugin' | 'unassigned'
  | 'road-moving' | 'firing' | 'moving' | 'crossfire';

export interface Terrain {
  name: string;
  type: string;
}

export type SideState = {
  nation: string,
  units: UnitState[],
  mods: Modifier[],
  bnMorale: number,
}

export type FireType = 'area' | 'point';

export type FireState = {
  attacker: SideState,
  defender: SideState,
  terrain: Terrain,
  distance: number,
  fireType: FireType,
}

/** a modifier as printed on the TCS tables, with whether it applies to the current fire */
export type TableModifier = {
  value: number,
  description: string,
  applies: boolean,
}

export function has(side: SideState, ...mods: Modifier[]) {
  return mods.some(mod => side.mods.includes(mod));
}

export function isProtective(terrain: Terrain) {
  return ['partly pro', 'protective'].includes(terrain.type);
}
