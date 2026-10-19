import {SideState} from "./state.ts";
import {Terrain} from "./terrainFromImgName.tsx";
import {unitStats} from "./unitName.tsx";

const spottedTable = {
  billiard: [+4, +2, -1],
  open: [+2, 0, -2],
  partly: [0, -2, -4],
  protective: [-1, -3, -5]
} as const;

const spottedVehicleTable = {
  ...spottedTable,
  // *+2 Move, +4 Fire for Vehicles and Carriers
  billiard: [+2, +4, -1]
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
const rowByTerrainType: Record<string, keyof typeof spottedTable> = {
  'billiard table': 'billiard',
  'open': 'open',
  'partly pro': 'partly',
  'protective': 'protective',
};

function postures(defender: SideState): (keyof typeof index)[] {
  const result: (keyof typeof index)[] = [];
  if (defender.mods.includes('dugin')) {
    result.push('dugin');
  }
  if (defender.mods.includes('moving')) {
    result.push('moving');
  }
  if (defender.mods.includes('firing') || result.length === 0) {
    result.push('fire');
  }
  return result;
}

/**
 * 11.3b Target Posture. If units in more than
 * one target posture occupy the hex, apply the
 * one that least favors the defender. Ignore
 * all Point targets, mounted units, as well as
 * all B-1 targets if the Area Fire cannot affect
 * them [11.1b]. Billiard Table modifiers apply
 * differently to Vehicles/Carriers.

 * Bold numbers: unspotted target fired on by any low-trajectory firer.
 */
export function targetTerrainPosture(defender: SideState, terrain: Terrain, ops: {
  spotted: boolean,
  includesLowTrajectory: boolean
}) {
  const row = rowByTerrainType[terrain.type];
  if (row === undefined) {
    return 0;
  }
  const areaTargets = defender.units
    .map(unitStats)
    .filter(unit => unit.targetType !== 'point');
  if (areaTargets.length === 0) {
    return 0;
  }
  const spotted = ops.spotted || !ops.includesLowTrajectory;
  const candidates = areaTargets.flatMap(unit => {
    const values = tableRow(row, unit.type, spotted);
    return postures(defender).map(posture => values[index[posture]]);
  });
  // apply the one that least favors the defender
  return Math.max(...candidates);
}

function tableRow(row: keyof typeof spottedTable, unitType: string, spotted: boolean): readonly number[] {
  if (!spotted) {
    return unspottedTable[row];
  }
  if (unitType === 'vehicle') {
    return spottedVehicleTable[row];
  }
  return spottedTable[row];
}