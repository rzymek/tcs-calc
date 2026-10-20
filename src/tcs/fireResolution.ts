import * as R from "remeda";
import {GameRules} from "./gameRules.ts";
import {FireState} from "./state.ts";
import {activeFirers, Firer, firers} from "./firers.ts";
import {spotting, Spotting} from "./spotting.ts";
import {isNoLOS} from "./los.ts";
import {otherModifiers} from "./otherModifiers.ts";
import {
  areaFirepower,
  areaFireRange,
  areaTargets,
  areaTargetStacking,
  includesLowTrajectory,
  infFirepower,
  infSteps
} from "./areaFire.ts";
import {targetTerrainPosture} from "./targetTerrainPosture.ts";
import {differential, pointFireRange, pointTargets} from "./pointFire.ts";
import {FiretableInput} from "./firetable.ts";
import {UnitStats} from "./unit.ts";

type CommonFire = {
  firers: Firer[],
  spotting: Spotting,
  spotted: boolean,
  noLOS: boolean,
  otherModifiers: ReturnType<typeof otherModifiers>,
  targetTerrainPosture: number,
  /** steps in the target hex that can be affected by the fire */
  targetSteps: number,
  /** whether the fire requires a Morale Check (on any result other than No Effect) */
  moraleCheck: boolean,
  /** why the fire is not possible */
  restriction?: string,
  notes: string[],
}

export type AreaFire = CommonFire & {
  type: 'area',
  firepower: number,
  infFirepower: number,
  firerInfSteps: number,
  areaTargetStacking: number,
  areaFireRange: number,
}

export type PointFire = CommonFire & {
  type: 'point',
  pSteps: number,
  pointFireRange: number,
  differential: ReturnType<typeof differential>,
}

export type Fire = AreaFire | PointFire;

export function fireResolution(state: FireState, rules: GameRules): Fire {
  const all = firers(state, rules);
  const firing = activeFirers(all);
  const firingStats = firing.map(it => it.stats);
  const spottingResult = spotting(state, firingStats, rules);
  const spotted = state.distance <= spottingResult.range;
  const noLOS = isNoLOS(state, spotted);
  const common = {
    firers: all,
    spotting: spottingResult,
    spotted,
    noLOS,
    otherModifiers: otherModifiers(state, firingStats),
    notes: rules.notes(state),
  };
  return state.fireType === 'area'
    ? areaFire(state, rules, firing, common)
    : pointFire(state, rules, firing, common);
}

type Common = Omit<CommonFire, 'targetTerrainPosture' | 'targetSteps' | 'moraleCheck' | 'restriction'>;

function areaFire(state: FireState, rules: GameRules, firing: Firer[], common: Common): AreaFire {
  const firingStats = firing.map(it => it.stats);
  const targets = areaTargets(state.defender, firingStats);
  const targetSteps = R.sumBy(targets, it => it.steps);
  const lowTrajectory = includesLowTrajectory(firingStats);
  return {
    ...common,
    type: 'area',
    firepower: areaFirepower(firing, rules),
    infFirepower: infFirepower(firing, state.distance),
    firerInfSteps: infSteps(firing),
    areaTargetStacking: areaTargetStacking(targetSteps, {spotted: common.spotted, lowTrajectory}),
    areaFireRange: areaFireRange(firingStats, state.distance),
    targetTerrainPosture: targetTerrainPosture(
      targets.map(it => it.stats), state.defender, state.terrain, !common.spotted && lowTrajectory),
    targetSteps,
    moraleCheck: true,
    restriction: restriction(common, firing, [
      [targetSteps === 0, 'No units in the target hex can be affected by Area Fire [11.1a]'],
    ]),
  };
}

function pointFire(state: FireState, rules: GameRules, firing: Firer[], common: Common): PointFire {
  const firingStats = firing.map(it => it.stats);
  const targets = pointTargets(state, rules);
  const targetStats: UnitStats[] = targets.map(it => it.stats);
  const differentialResult = differential(firingStats, targetStats);
  return {
    ...common,
    type: 'point',
    pSteps: R.sumBy(firing, it => it.steps),
    pointFireRange: pointFireRange(firingStats, state.distance, rules),
    differential: differentialResult,
    targetTerrainPosture: targetTerrainPosture(targetStats, state.defender, state.terrain, false),
    targetSteps: R.sumBy(targets, it => it.steps),
    moraleCheck: rules.pointFireMoraleCheck(state),
    restriction: restriction(common, firing, [
      [targets.length === 0, 'No Point targets or B-targets in the target hex [12.0]'],
      [!common.spotted, 'Point Fires only at spotted targets [7.1b, 14.1a]'],
      [differentialResult.shift === undefined, 'Differential of –5 or lower: fire not allowed [12.1c]'],
    ]),
  };
}

function restriction(common: Common, firing: Firer[], checks: [boolean, string][]): string | undefined {
  const all: [boolean, string][] = [
    [firing.length === 0, 'No eligible firers'],
    [common.noLOS, 'No LOS'],
    ...checks,
  ];
  return all.find(([failed]) => failed)?.[1];
}

function fireShift(fire: Fire): number {
  if (fire.type === 'area') {
    return R.sum([fire.areaTargetStacking, fire.areaFireRange, fire.targetTerrainPosture, fire.otherModifiers.total]);
  }
  return R.sum([fire.targetTerrainPosture, fire.pointFireRange, fire.differential.shift ?? 0, fire.otherModifiers.total]);
}

/** undefined if the fire is not possible */
export function fireTableInput(fire: Fire): FiretableInput | undefined {
  if (fire.restriction !== undefined) {
    return undefined;
  }
  const shift = fireShift(fire);
  return fire.type === 'area'
    ? {shift, firepower: fire.firepower + fire.infFirepower}
    : {shift, pSteps: fire.pSteps};
}
