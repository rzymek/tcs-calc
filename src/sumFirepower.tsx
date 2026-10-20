import {SideState} from "./state.ts";
import * as R from "remeda";
import {unitStats} from "./unitName.tsx";

export function sumFirepower(side: SideState) {
  return R.pipe(side.units,
    R.map(unitStats),
    R.filter(unit => unit.firerType === 'area'),
    R.sumBy(unit => unit.fireStrength),
  );
}
