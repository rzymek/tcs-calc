import {SideState} from "./state.ts";
import {unitStats} from "./unitName.tsx";
import * as R from "remeda";

export function countSteps(side: SideState) {
  const unitSteps = R.sumBy(side.units, unit => unitStats(unit).steps);
  const losses = R.sumBy(side.stepLosses, Number);
  return Math.max(0, unitSteps - losses);
}
