import {FireState} from "./tcs/state.ts";
import {ARGENTINE, BRITAIN} from "./goosegreen/rules.ts";

export type State = FireState;
export type Role = 'attacker' | 'defender';

export const initialState: State = {
  attacker: {
    nation: BRITAIN,
    units: [],
    mods: [],
    bnMorale: 0,
  },
  defender: {
    nation: ARGENTINE,
    units: [],
    mods: [],
    bnMorale: 0,
  },
  terrain: {
    name: 'clean',
    type: 'open',
  },
  distance: 1,
  fireType: 'area',
}