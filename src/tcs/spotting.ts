import * as R from "remeda";
import {GameRules} from "./gameRules.ts";
import {FireState, has, isProtective, TableModifier} from "./state.ts";
import {remainingSteps, UnitStats, unitStats} from "./unit.ts";

export const spottingColumns: readonly number[] = [0, 1, 2, 3, 4, 6, 8, 12, Infinity];

/** starting column of the Spotting Range Table [7.1e] */
export function baseSpottingRange(unit: UnitStats): number {
  if (['ig', 'aa', 'arty'].includes(unit.type)) {
    return 4;
  }
  if (unit.targetType === 'point') {
    return 8; // Vehicle, Carrier
  }
  return 3; // A-target, AT
}

function spottingShifts(state: FireState, firers: UnitStats[], rules: GameRules): TableModifier[] {
  const {attacker, defender, terrain} = state;
  const night = has(defender, 'night');
  const illum = has(defender, 'illum');
  const firerShift = R.firstBy(firers.flatMap(unit => rules.firerSpottingShift(unit) ?? []), [it => it.value, 'desc']);
  return [
    // target
    {value: +2, description: 'Target: Billiard', applies: terrain.type === 'billiard table'},
    {value: -1, description: 'Target: Partly Protective or Protective', applies: isProtective(terrain)},
    {value: +4, description: 'Target: Fired marker or Fire Trigger', applies: has(defender, 'firing')},
    {value: +2, description: 'Target: Road Moving', applies: has(defender, 'road-moving')},
    {value: +1, description: 'Target: Move Mode', applies: has(defender, 'moving')},
    {value: -3, description: 'Target: Night', applies: night && !illum},
    {value: -1, description: 'Target: Night, illuminated', applies: night && illum},
    {value: -1, description: 'Target: Twilight', applies: has(defender, 'twilight')},
    {value: -1, description: 'Target: Dug-In', applies: has(defender, 'dugin')},
    // firer
    {value: +1, description: 'Firer: Dug-in', applies: has(attacker, 'dugin')},
    ...(firerShift ? [{...firerShift, applies: true}] : []),
    // both (cumulative)
    ...([['Firer', attacker], ['Target', defender]] as const).flatMap(([label, side]) => [
      {value: -1, description: `${label}: Smoke`, applies: has(side, 'smoke')},
      {value: -1, description: `${label}: Artillery Attack Zone`, applies: has(side, 'arty')},
      {value: -1, description: `${label}: Suppressed or Paralyzed`, applies: has(side, 'suppressed', 'paralyzed')},
    ]),
  ];
}

export type Spotting = ReturnType<typeof spotting>;

/**
 * 7.1e Find the column for target type and shift columns. Use the unit in the target hex
 * that produces the LONGEST Spotting Range. 7.1a Ranges that shift left off the table
 * are 0; those shifting right off the table are unlimited.
 */
export function spotting(state: FireState, firers: UnitStats[], rules: GameRules) {
  const shifts = spottingShifts(state, firers, rules);
  const targets = state.defender.units
    .filter(unit => remainingSteps(unit) > 0)
    .map(unit => unitStats(unit.def));
  if (targets.length === 0) {
    return {base: Infinity, shifts, range: Infinity};
  }
  const base = Math.max(...targets.map(baseSpottingRange));
  const shift = R.sumBy(shifts.filter(it => it.applies), it => it.value);
  const index = R.clamp(spottingColumns.indexOf(base) + shift, {min: 0, max: spottingColumns.length - 1});
  return {base, shifts, range: spottingColumns[index]};
}
