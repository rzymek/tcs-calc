import {State} from "./state.ts";
import {unitStats} from "./unitName.tsx";
import * as R from "remeda";
export function includesLowTrajectory(state: State) {
  return R.pipe(state.attacker.units,
    R.map(unitStats),
    R.filter(unit => unit.trajectory === 'low'),
    R.hasAtLeast(1)
  );
}