import {SideState} from "./state.ts";
import {unitStats} from "./unitName.tsx";
import {Modifier} from "./modifiers.tsx";

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
 *   -2 Arty Attack Zone
 *   -1 Smoke (1)
 *
 * (1) Does not apply to Artillery
 * (2) Overwatch or moving through Artillery
 * (3) Not at range 0
 * (4) Low-Trajectory Area Fire only (tank cover)
 */
export function otherModifiersCandidates(attacker: SideState, defender: SideState, distance: number) {
  const firers = attacker.units.map(unitStats);
  const artillery = firers.length > 0 && firers.every(unit => unit.type === 'arty');
  const lowTrajectoryAreaFire = firers.some(unit => unit.firerType === 'area' && unit.trajectory === 'low');
  const pTwoPlusTarget = defender.units
    .map(unitStats)
    .some(unit => unit.targetType !== 'area' && unit.defenseStrength >= 2);
  const has = (side: SideState, ...mods: Modifier[]) => mods.some(mod => side.mods.includes(mod));

  return [
    // target
    {value: -2, description: 'Target: Night', applies: has(defender, 'night') && !artillery},
    {value: -1, description: 'Target: Illuminated or Twilight', applies: has(defender, 'illum', 'twilight') && !artillery},
    {value: +2, description: 'Target: Road moving', applies: has(defender, 'road-moving')},
    {value: -2, description: 'Target: All Suppressed or Paralyzed', applies: has(defender, 'suppressed', 'paralyzed') && distance > 0},
    {value: -2, description: 'Target: P-2+ target in hex', applies: pTwoPlusTarget && lowTrajectoryAreaFire},
    // firer
    {value: -2, description: 'Firer: Any Suppressed or Paralyzed', applies: has(attacker, 'suppressed', 'paralyzed')},
    {value: +4, description: 'Firer: Cross fire', applies: has(defender, 'crossfire')},
    // both (cumulative)
    ...([['Firer', attacker], ['Target', defender]] as const).flatMap(([label, side]) => [
      {value: -2, description: `${label}: Arty Attack Zone`, applies: has(side, 'arty')},
      {value: -1, description: `${label}: Smoke`, applies: has(side, 'smoke') && !artillery},
    ]),
  ];
}

export function otherModifiers(attacker: SideState, defender: SideState, distance: number) {
  const applied = otherModifiersCandidates(attacker, defender, distance)
    .filter(it => it.applies)
    .map(({value, description}) => ({value, description}));
  return {
    modifiers: applied,
    total: applied.reduce((sum, it) => sum + it.value, 0),
  };
}
