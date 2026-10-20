import {GameRules, tcsRules} from "../tcs/gameRules.ts";
import {FireState, has} from "../tcs/state.ts";
import {remainingSteps, UnitDef, UnitStats, unitStats} from "../tcs/unit.ts";

/** Goose Green, TCS #18 special rules */

export const BRITAIN = 'Britain';
export const ARGENTINE = 'Argentine';

const isMilan = (unit: UnitStats) => unit.type === 'milan';
// 3.3c AT-12 is a 105mm Recoilless Rifle
const isRecoillessRifle = (unit: UnitStats) => unit.type === 'at';
// 3.3b Mtr-12: the 120mm mortar with a Fire strength of 3*
const mtr12 = '3w.53w.6w.1.mrt';

// 2.4a Argentinian Inf units occupying Trench or Building hexes are treated as B-targets for the MILAN
function milanAtDugInInfantry(state: FireState) {
  return state.fireType === 'point'
    && state.attacker.units.some(unit => isMilan(unitStats(unit.def)))
    && state.defender.nation === ARGENTINE
    && ['trench', 'buildings'].includes(state.terrain.name);
}

export const goosegreenRules: GameRules = {
  ...tcsRules,
  unitMorale(unit, nation) {
    // 3.1 Argentinian units without a printed morale have a morale value of 7
    if (nation === ARGENTINE && unit.targetType === 'both') {
      return 7;
    }
    return tcsRules.unitMorale(unit, nation);
  },
  // 2.2b British units do not apply the +1 Morale modifier for night
  nightMoraleModifier: nation => nation !== BRITAIN,
  areaFireStrength(unit, steps) {
    // 3.3c The RR unit is a P-firer but fires at full strength against A-targets (unlike AT guns)
    if (isRecoillessRifle(unit) && steps > 0) {
      return unit.fireStrength * steps;
    }
    return tcsRules.areaFireStrength(unit, steps);
  },
  fireRestriction(unit, state) {
    const {attacker, defender, terrain, distance} = state;
    if (isMilan(unit)) {
      if (state.fireType === 'area') {
        return 'MILAN may only conduct Point Fires [GG 2.4a]';
      }
      if (distance < 2) {
        return 'MILAN minimum range is two hexes [GG 2.4a]';
      }
      if (has(defender, 'night') && !has(defender, 'illum')) {
        return 'MILAN may not fire at night unless the target is illuminated [GG 2.4a]';
      }
    }
    if (terrain.name === 'gully' && distance > 1) {
      return 'Only adjacent units may fire into Gully hexes [GG 1.1a]';
    }
    if (terrain.name === 'settlement' && attacker.nation === BRITAIN && unit.type !== 'inf') {
      return 'Only British Infantry may fire into settlement hexes [GG 2.7b]';
    }
    return tcsRules.fireRestriction(unit, state);
  },
  notes(state) {
    const notes = [...tcsRules.notes(state)];
    if (state.fireType === 'area' && state.attacker.units.some(unit => UnitDef.unbrand(unit.def) === mtr12 && remainingSteps(unit) > 0)) {
      notes.push('Mtr-12 (120mm) fires only on a die roll of 1; a failed attempt counts as a fire [GG 3.3b]');
    }
    if (state.defender.nation === ARGENTINE && has(state.defender, 'dugin') && state.terrain.name !== 'trench') {
      notes.push('Argentinian units may be Dug-In only in Trench hexes [GG 3.3f]');
    }
    return notes;
  },
  firerSpottingShift(unit) {
    // 2.4a Because of its superior sights, the MILAN unit receives a +2 modifier on the Spotting Table
    return isMilan(unit) ? {value: +2, description: 'Firer: MILAN sights [GG 2.4a]'} : tcsRules.firerSpottingShift(unit);
  },
  pointFireRange(unit, distance) {
    // 2.4a all MILAN fires use the Close Range modifier (+5) since they are guided fires
    if (isMilan(unit)) {
      return distance <= 2 * unit.range ? 'close' : undefined;
    }
    return tcsRules.pointFireRange(unit, distance);
  },
  pointTarget(unit, state) {
    if (milanAtDugInInfantry(state) && unit.type === 'inf' && unit.targetType === 'area') {
      const {morale: _, ...stats} = unit;
      return {...stats, targetType: 'both', defenseStrength: 0};
    }
    return tcsRules.pointTarget(unit, state);
  },
  // 2.4a such Point Fire step losses inflict Area target step losses, causing a Morale Check
  pointFireMoraleCheck: state => milanAtDugInInfantry(state) || tcsRules.pointFireMoraleCheck(state),
};
