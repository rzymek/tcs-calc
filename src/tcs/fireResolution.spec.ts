import {describe, expect, it} from "vitest";
import {fireResolution, fireTableInput} from "./fireResolution.ts";
import {tcsRules} from "./gameRules.ts";
import {fireTable} from "./firetable.ts";
import {FireState} from "./state.ts";
import {fireState, inf, mg, side, vehicle} from "./fixtures.ts";

function resolve(state: FireState) {
  const fire = fireResolution(state, tcsRules);
  const input = fireTableInput(fire);
  return {fire, input, column: input && fireTable.column(input).label};
}

const panther = '5y.7b.4y.1.vehicle';
const sherman = '3y.7b.3y.1.vehicle';

describe('Area Fire', () => {
  it('resolves a spotted fire at range 1', () => {
    const {fire, input} = resolve(fireState({attacker: side([inf, mg]), defender: side([inf]), distance: 1}));
    expect(fire).toMatchObject({
      type: 'area',
      firepower: 4 + 3,
      infFirepower: 3,
      areaTargetStacking: 0,
      areaFireRange: 2,
      targetTerrainPosture: 0,
      otherModifiers: {modifiers: [], total: 0},
      firerInfSteps: 5,
      targetSteps: 5,
      noLOS: false,
      spotted: true,
      moraleCheck: true,
      restriction: undefined,
    });
    expect(input).toEqual({shift: 2, firepower: 7 + 3});
  });

  it('11.1 example: shifted +1 and resolved on the 14-16 column', () => {
    const {fire, column} = resolve(fireState({
      // two Infantry platoons at range 4 and a Mortar: Fire strength 11
      attacker: side([inf, inf, '3w.40w.6w.2.mrt']),
      // a 5-step Infantry platoon in Move Mode and a towed AT Gun
      defender: side([inf, '2y.10b.0b.1.at'], ['moving']),
      distance: 4,
    }));
    expect(fire).toMatchObject({firepower: 11, targetSteps: 6, areaTargetStacking: 0, areaFireRange: -1, targetTerrainPosture: 2});
    expect(column).toBe('14-16');
  });

  it('13.1 example: total attack strength 18, net shift -2, column 11-13', () => {
    const {fire, column} = resolve(fireState({
      // two Infantry platoons, two MG sections, two AT Guns (halved) and a Mortar
      attacker: side([inf, inf, '2w.10b.5w.2.mg', '2w.10b.5w.2.mg', '2y.10b.0b.1.at', '2y.10b.0b.1.at', '4w.40w.6w.2.mrt']),
      // an Infantry platoon, a MG section and an AT Gun in Fire Mode with a Fired marker
      defender: side([inf, mg, '5y.10b.0b.1.at'], ['firing']),
      terrain: {name: 'woods', type: 'partly pro'},
      distance: 4,
    }));
    expect(fire).toMatchObject({
      firepower: 18,
      spotting: {range: 8},
      spotted: true,
      targetSteps: 8,
      areaTargetStacking: 1,
      areaFireRange: -1,
      targetTerrainPosture: -2,
    });
    expect(column).toBe('11-13');
  });

  it('resolves an unspotted fire at night', () => {
    const {fire} = resolve(fireState({attacker: side([inf, mg]), defender: side([inf], ['night']), distance: 2}));
    expect(fire).toMatchObject({
      areaFireRange: 1,
      targetTerrainPosture: -2,
      otherModifiers: {total: -2},
      spotted: false,
      noLOS: false,
    });
  });

  it.each([
    {name: 'no firers', state: fireState({defender: side([inf])}), restriction: 'No eligible firers'},
    {
      name: 'only Point targets',
      state: fireState({attacker: side([inf]), defender: side([vehicle])}),
      restriction: 'No units in the target hex can be affected by Area Fire [11.1a]'
    },
    {
      name: 'beyond Visibility at night',
      state: fireState({attacker: side([mg]), defender: side([inf], ['night']), distance: 3}),
      restriction: 'No LOS'
    },
    {
      name: 'Paralyzed firers',
      state: fireState({attacker: side([inf], ['paralyzed']), defender: side([inf])}),
      restriction: 'No eligible firers'
    },
  ])('not possible: $name', ({state, restriction}) => {
    const {fire, input} = resolve(state);
    expect(fire.restriction).toBe(restriction);
    expect(input).toBeUndefined();
  });

  it('firers beyond their range do not fire [11.1a]', () => {
    const {fire} = resolve(fireState({attacker: side([inf, mg]), defender: side([inf]), distance: 6}));
    expect(fire.firers.map(it => it.restriction)).toEqual(['Beyond maximum range [11.1a]', undefined]);
    expect(fire.type === 'area' && fire.firepower).toBe(3);
  });
});

describe('Point Fire', () => {
  it('12.2 example: Panther fires on two Shermans at range 8, landing on the 6 column', () => {
    const {fire, input, column} = resolve(fireState({
      fireType: 'point',
      attacker: side([panther]),
      defender: side([sherman, sherman]),
      distance: 8,
    }));
    expect(fire).toMatchObject({
      type: 'point',
      pSteps: 1,
      pointFireRange: 0,
      targetTerrainPosture: 0,
      differential: {value: 2, shift: 2},
      targetSteps: 2,
      moraleCheck: false,
    });
    expect(column).toBe('6');
    expect(fireTable.result(input!, 65)).toBe('-1 step');
    expect(fireTable.result(input!, 66)).toBe('-2 steps');
  });

  it('12.2 example: the Sherman needs a 63 to kill the Panther', () => {
    const {input, column} = resolve(fireState({
      fireType: 'point',
      attacker: side([sherman]),
      defender: side([panther]),
      distance: 8,
    }));
    expect(column).toBe('2');
    expect(fireTable.result(input!, 62)).toBe('Morale Check');
    expect(fireTable.result(input!, 63)).toBe('-1 step');
  });

  it('only P-firers take part', () => {
    const {fire} = resolve(fireState({fireType: 'point', attacker: side([inf, panther]), defender: side([sherman])}));
    expect(fire.firers.map(it => it.restriction)).toEqual(['Not a P-firer', undefined]);
  });

  it.each([
    {
      name: 'no Point targets',
      state: fireState({fireType: 'point', attacker: side([panther]), defender: side([inf])}),
      restriction: 'No Point targets or B-targets in the target hex [12.0]'
    },
    {
      name: 'unspotted target',
      state: fireState({fireType: 'point', attacker: side([panther]), defender: side([sherman]), distance: 9}),
      restriction: 'Point Fires only at spotted targets [7.1b, 14.1a]'
    },
    {
      name: 'differential -5',
      state: fireState({fireType: 'point', attacker: side(['1y.7b.1y.1.vehicle']), defender: side(['1y.7b.6y.1.vehicle'])}),
      restriction: 'Differential of –5 or lower: fire not allowed [12.1c]'
    },
    {
      name: 'beyond twice the nominal range',
      state: fireState({fireType: 'point', attacker: side([panther]), defender: side([sherman], ['firing']), distance: 15}),
      restriction: 'No eligible firers'
    },
  ])('not possible: $name', ({state, restriction}) => {
    const {fire, input} = resolve(state);
    expect(fire.restriction).toBe(restriction);
    expect(input).toBeUndefined();
  });
});
