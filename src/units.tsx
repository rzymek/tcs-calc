import {useSide} from "./useSide.tsx";
import {cell} from "./mainLayoutCell.tsx";
import {bgColor} from "./bgColor.tsx";
import {size} from "./size.tsx";
import {UnitDef, unitName} from "./tcs/unit.ts";
import {countersByNation} from "./goosegreen/counters.ts";
import {Role} from "./state.ts";

const steps = import.meta.glob<string>(`./images/steps/*.png`, {eager: true, query: '?url', import: 'default'});

const urlByName: Record<string, string> = Object.fromEntries(
  [...Object.values(countersByNation).flatMap(Object.entries), ...Object.entries(steps)]
    .map(([path, url]) => [unitName(path), url])
);
const stepLosses = Object.keys(steps).map(path => Number(UnitDef.unbrand(unitName(path))));

export function unitUrl(name: UnitDef) {
  return urlByName[UnitDef.unbrand(name)];
}

export function stepLossUrl(losses: number) {
  return urlByName[String(losses)];
}

export function Units(props: {
  side: Role,
  onAdded(index: number): void,
}) {
  const [side, update] = useSide(props.side);
  const counters = countersByNation[side.nation] ?? {};
  return <div style={{...cell, background: bgColor[props.side], gap: '1mm', padding:'1mm'}}>
    {Object.keys(counters).map(unitName).map(name =>
      <img src={unitUrl(name)}
           style={{width: `${size}mm`, cursor: 'pointer'}}
           alt={`${name}`}
           onClick={() => {
             update('units')(prev => [...prev, {def: name, losses: 0}]);
             props.onAdded(side.units.length);
           }}/>
    )}
  </div>;
}

/** 10.0 Step Loss markers, placed under the selected unit */
export function StepLosses(props: {
  side: Role,
  selected: number | undefined,
}) {
  const [side, update] = useSide(props.side);
  const selectedUnit = props.selected === undefined ? undefined : side.units[props.selected];
  const setLosses = (losses: number) => update('units')(prev => prev.map((unit, idx) =>
    idx === props.selected ? {...unit, losses: unit.losses === losses ? 0 : losses} : unit));
  return <div style={{...cell, background: bgColor[props.side], gap: '1mm', padding: '1mm'}}>
    {stepLosses.map(losses =>
      <img src={stepLossUrl(losses)}
           style={{
             width: `${size}mm`,
             cursor: 'pointer',
             opacity: selectedUnit ? 1 : 0.4,
             outline: selectedUnit?.losses === losses ? '2px solid blue' : undefined,
           }}
           alt={`${losses}`}
           onClick={() => selectedUnit && setLosses(losses)}/>
    )}
  </div>;
}
