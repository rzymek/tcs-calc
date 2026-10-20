import {describe, expect, it} from "vitest";
import {ARGENTINE, BRITAIN, goosegreenRules as rules} from "./rules.ts";
import {fireResolution, fireTableInput} from "../tcs/fireResolution.ts";
import {moraleBreakdown} from "../tcs/moraleCheck.ts";
import {fireTable} from "../tcs/firetable.ts";
import {FireState, Terrain} from "../tcs/state.ts";
import {UnitDef, unitStats} from "../tcs/unit.ts";
import {arty, atGun, fireState, inf, mg, milan, side} from "../tcs/fixtures.ts";

const stats = (def: string) => unitStats(UnitDef.brand(def));
const trench: Terrain = {name: 'trench', type: 'partly pro'};

function restrictions(state: FireState) {
  return fireResolution(state, rules).firers.map(it => it.restriction);
}

describe('Goose Green', () => {
  describe('3.1 Argentinian units without a printed morale have a morale value of 7', () => {
    it.each([atGun, arty])('%s', def => {
      expect(rules.unitMorale(stats(def), ARGENTINE)).toBe(7);
    });
    it('printed morale', () => {
      expect(rules.unitMorale(stats(inf), ARGENTINE)).toBe(5);
    });
  });

  it('2.2b British units do not apply the +1 Morale modifier for night', () => {
    const morale = (nation: string) => moraleBreakdown(fireState({
      attacker: side([mg]),
      defender: side([inf], ['night'], {nation}),
    }), [stats(mg)], rules)?.total;
    expect(morale(BRITAIN)).toBe(5);
    expect(morale(ARGENTINE)).toBe(5 + 1);
  });

  it('3.3c the Recoilless Rifle fires at full strength against A-targets', () => {
    expect(rules.areaFireStrength(stats(atGun), 2)).toBe(2 * 5);
  });

  describe('2.4a MILAN', () => {
    const milanFire = (props: Partial<FireState>) => fireState({
      fireType: 'point',
      attacker: side([milan], [], {nation: BRITAIN}),
      defender: side(['1y.7b.2y.1.vehicle'], ['firing'], {nation: ARGENTINE}),
      distance: 3,
      ...props,
    });

    it('may only conduct Point Fires', () => {
      expect(restrictions(milanFire({fireType: 'area'}))).toEqual(['MILAN may only conduct Point Fires [GG 2.4a]']);
    });
    it('has a minimum range of two hexes', () => {
      expect(restrictions(milanFire({distance: 1}))).toEqual(['MILAN minimum range is two hexes [GG 2.4a]']);
      expect(restrictions(milanFire({distance: 2}))).toEqual([undefined]);
    });
    it('may not fire at night unless the target is illuminated', () => {
      const defender = (mods: FireState['defender']['mods']) => side(['1y.7b.2y.1.vehicle'], mods, {nation: ARGENTINE});
      expect(restrictions(milanFire({defender: defender(['night'])})))
        .toEqual(['MILAN may not fire at night unless the target is illuminated [GG 2.4a]']);
      expect(restrictions(milanFire({defender: defender(['night', 'illum'])}))).toEqual([undefined]);
    });
    it('always uses the Close Range modifier', () => {
      expect(rules.pointFireRange(stats(milan), 18)).toBe('close');
      expect(rules.pointFireRange(stats(milan), 19)).toBeUndefined();
    });
    it('receives a +2 modifier on the Spotting Table', () => {
      expect(rules.firerSpottingShift(stats(milan))?.value).toBe(2);
      expect(rules.firerSpottingShift(stats(inf))).toBeUndefined();
    });
    it('Argentinian Inf in Trench or Building hexes are B-targets and check Morale', () => {
      const fire = fireResolution(milanFire({defender: side([inf], [], {nation: ARGENTINE}), terrain: trench}), rules);
      expect(fire).toMatchObject({
        type: 'point',
        restriction: undefined,
        moraleCheck: true,
        pointFireRange: 5,
        differential: {value: 14, shift: 3},
        targetTerrainPosture: -2,
      });
      expect(fireTable.column(fireTableInput(fire)!).label).toBe('26-32');
    });
    it('Argentinian Inf in other terrain are not Point targets', () => {
      const fire = fireResolution(milanFire({defender: side([inf], [], {nation: ARGENTINE})}), rules);
      expect(fire.restriction).toBe('No Point targets or B-targets in the target hex [12.0]');
    });
  });

  describe('1.1a only adjacent units may fire into Gully hexes', () => {
    const gully = (distance: number) => fireState({
      attacker: side([mg]), defender: side([inf]), terrain: {name: 'gully', type: 'partly pro'}, distance,
    });
    it.each([
      {distance: 1, expected: undefined},
      {distance: 2, expected: 'Only adjacent units may fire into Gully hexes [GG 1.1a]'},
    ])('distance $distance', ({distance, expected}) => {
      expect(restrictions(gully(distance))).toEqual([expected]);
    });
  });

  it('2.7b only British Infantry may fire into settlement hexes', () => {
    const settlement = (nation: string) => fireState({
      attacker: side([inf, mg], [], {nation}),
      defender: side([inf]),
      terrain: {name: 'settlement', type: 'partly pro'},
    });
    expect(restrictions(settlement(BRITAIN))).toEqual([undefined, 'Only British Infantry may fire into settlement hexes [GG 2.7b]']);
    expect(restrictions(settlement(ARGENTINE))).toEqual([undefined, undefined]);
  });

  describe('notes', () => {
    it('3.3b Mtr-12 fires only on a die roll of 1', () => {
      expect(rules.notes(fireState({attacker: side(['3w.53w.6w.1.mrt'])})))
        .toEqual(['Mtr-12 (120mm) fires only on a die roll of 1; a failed attempt counts as a fire [GG 3.3b]']);
      expect(rules.notes(fireState({attacker: side(['6w.53w.6w.1.mrt'])}))).toEqual([]);
    });
    it('3.3f Argentinian units may be Dug-In only in Trench hexes', () => {
      const dugIn = (terrain: Terrain) => rules.notes(fireState({
        defender: side([inf], ['dugin'], {nation: ARGENTINE}),
        terrain,
      }));
      expect(dugIn({name: 'clean', type: 'open'})).toEqual(['Argentinian units may be Dug-In only in Trench hexes [GG 3.3f]']);
      expect(dugIn(trench)).toEqual([]);
    });
  });
});
