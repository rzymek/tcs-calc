import {SideState} from "./state.ts";
import {Terrain} from "./terrainFromImgName.tsx";

const spottedTable = {
  billiard: [+4, +2, -1],
  open: [+2, 0, -2],
  partly: [0, -2, -4],
  protective: [-1, -3, -5]
} as const;
const unspottedTable = {
  billiard: [+2, 0, -3],
  open: [0, -2, -5],
  partly: [-2, -5, -7],
  protective: [-3, -6, -8]
} as const;
const index = {
  moving: 0,
  fire: 1,
  dugin: 2,
} as const;

export function targetTerrainPosture(defender: SideState, terrain: Terrain, ops: { spotted: boolean }) {
  return 0;
}