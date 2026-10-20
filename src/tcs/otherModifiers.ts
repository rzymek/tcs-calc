import {FireState, has, TableModifier} from "./state.ts";
import {remainingSteps, UnitStats, unitStats} from "./unit.ts";
import {includesLowTrajectory} from "./areaFire.ts";

/** 11.4 a Cross Fire needs two Low-Trajectory firers; High-Trajectory firers cannot help to create one [11.2a] */
export function crossFirePossible(firers: UnitStats[]) {
  return firers.filter(unit => unit.trajectory === 'low').length >= 2;
}

/** 11.3f a Vehicle step with a P-defense rating of 2 or higher in the target hex */
export function pTwoPlusTargetInHex(state: FireState) {
  return state.defender.units
    .filter(unit => remainingSteps(unit) > 0)
    .map(unit => unitStats(unit.def))
    .some(unit => unit.targetType !== 'area' && unit.defenseStrength >= 2);
}

/**
 * OTHER MODIFIERS:
 * TARGET...
 *   -2 Night (1)
 *   -1 Illuminated or Twilight (1)
 *   +2 Road moving (2)
 *   -2 All Suppressed or Paralyzed (3)
 *   -2 P-2+ target in hex (4)
 * FIRER...
 *   -2 Any Suppressed or Paralyzed
 *   +4 Cross fire [11.4]
 * BOTH... (cumulative)
 *   -2 Arty Attack Zone (1)
 *   -1 Smoke (1)
 *
 * (1) Does not apply to Artillery (Barrages are out of scope of this app)
 * (2) Overwatch or moving through Artillery
 * (3) Not at range 0
 * (4) Low-Trajectory Area Fire only (tank cover)
 */
export function otherModifiersCandidates(state: FireState, firers: UnitStats[]): TableModifier[] {
  const {attacker, defender, distance} = state;
  const night = has(defender, 'night');
  const illum = has(defender, 'illum');
  const crossFire = crossFirePossible(firers);

  return [
    // target
    {value: -2, description: 'Target: Night', applies: night && !illum},
    // 26.2b an illuminated area acts as a spot of daylight
    {value: -1, description: 'Target: Illuminated or Twilight', applies: (night && illum) || has(defender, 'twilight')},
    {value: +2, description: 'Target: Road moving', applies: has(defender, 'road-moving')},
    {value: -2, description: 'Target: All Suppressed or Paralyzed', applies: has(defender, 'suppressed', 'paralyzed') && distance > 0},
    {
      value: -2,
      description: 'Target: P-2+ target in hex',
      applies: state.fireType === 'area' && pTwoPlusTargetInHex(state) && includesLowTrajectory(firers)
    },
    // firer
    {value: -2, description: 'Firer: Any Suppressed or Paralyzed', applies: has(attacker, 'suppressed', 'paralyzed')},
    {
      value: +4,
      description: crossFire ? 'Firer: Cross fire' : 'Firer: Cross fire (needs 2+ Low-Trajectory firers)',
      applies: has(defender, 'crossfire') && crossFire
    },
    // both (cumulative)
    ...([['Firer', attacker], ['Target', defender]] as const).flatMap(([label, side]) => [
      {value: -2, description: `${label}: Arty Attack Zone`, applies: has(side, 'arty')},
      {value: -1, description: `${label}: Smoke`, applies: has(side, 'smoke')},
    ]),
  ];
}

export function otherModifiers(state: FireState, firers: UnitStats[]) {
  const applied = otherModifiersCandidates(state, firers)
    .filter(it => it.applies)
    .map(({value, description}) => ({value, description}));
  return {
    modifiers: applied,
    total: applied.reduce((sum, it) => sum + it.value, 0),
  };
}
