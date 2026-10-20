import {Terrain} from "./terrainFromImgName.tsx";
import {UnitDef} from "./unitName.tsx";
import {Modifier} from "./modifiers.tsx";

export type SideState = {
  units: UnitDef[],
  stepLosses: string[],
  mods: Modifier[],
}
export type State = {
  attackingSide: 'Britain' | 'Argentine',
  attacker: SideState,
  defender: SideState,
  terrain: Terrain,
  distance: number,
};

export const initialState: State = {
  attackingSide: 'Britain',
  attacker: {
    units: [],
    stepLosses: [],
    mods: []
  },
  defender: {
    units: [],
    stepLosses: [],
    mods: []
  },
  terrain: {
    name: 'clean',
    type: 'open',
  },
  distance: 1,
}