import {FireState, Modifier, SideState} from "./state.ts";
import {UnitDef, UnitState} from "./unit.ts";

// sample counters, '<fire>.<range>.<morale|defense>[.<steps>][.<type>]'
export const inf = '4w.5b.5w';                 // fire 4, range 5, morale 5, 5 steps
export const goodInf = '7w.5b.1w';             // morale 1
export const mg = '3w.10b.5w.2.mg';            // low trajectory
export const mortar = '4w.40w.6w.2.mrt';       // high trajectory
export const arty = '6w.40w.0b.3.arty';        // On-Map Artillery, B-0
export const aa = '4w.12b.0b.1.aa';
export const atGun = '5y.10b.0b.2.at';         // P-firer, B-0
export const milan = '14y.9b.0b.2.milan';
export const vehicle = '1y.7b.2y.1.vehicle';   // P-2 target

export function unit(def: string, losses = 0): UnitState {
  return {def: UnitDef.brand(def), losses};
}

export function side(units: (string | UnitState)[] = [], mods: Modifier[] = [], props: Partial<SideState> = {}): SideState {
  return {
    nation: 'Red',
    units: units.map(it => typeof it === 'string' ? unit(it) : it),
    mods,
    bnMorale: 0,
    ...props,
  };
}

export function fireState(props: Partial<FireState> = {}): FireState {
  return {
    attacker: side(),
    defender: side(),
    terrain: {name: 'clean', type: 'open'},
    distance: 1,
    fireType: 'area',
    ...props,
  };
}
