import {useSide} from "./useSide.tsx";
import {cell} from "./mainLayoutCell.tsx";
import {bgColor} from "./bgColor.tsx";
import {size} from "./size.tsx";
import {UnitDef, unitName} from "./tcs/unit.ts";
import {countersByNation} from "./goosegreen/counters.ts";
import {Role} from "./state.ts";
import {ComponentChildren} from "preact";

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

const pxPerMm = 96 / 25.4;
const bagPadding = 1; // mm
const bagGap = 1; // mm
const bagBorder = 1; // px

export function counterCount(nation: string) {
  return Object.keys(countersByNation[nation] ?? {}).length;
}

export const stepLossCount = stepLosses.length;

/** CSS height of a wrapping bag of `count` square counters that fits them all within `width` px */
export function bagHeight(count: number, width: number) {
  const inner = (width - 2 * bagBorder) / pxPerMm - 2 * bagPadding;
  const perRow = Math.max(1, Math.floor((inner + bagGap) / (size + bagGap)));
  const rows = Math.max(1, Math.ceil(count / perRow));
  return `calc(${rows * (size + bagGap) - bagGap + 2 * bagPadding}mm + ${2 * bagBorder}px)`;
}

export function CounterBag(props: { children: ComponentChildren }) {
  return <div style={{
    ...cell,
    gridColumn: 'span 2',
    overflow: 'hidden',
    gap: `${bagGap}mm`,
    padding: `${bagPadding}mm`,
    border: `${bagBorder}px solid black`,
  }}>
    {props.children}
  </div>;
}

// a half-gap ring in the side's color, so it doesn't affect the layout
const sideRing = (role: Role) => `0 0 0 ${bagGap / 2}mm ${bgColor[role]}`;

export function Units(props: {
  side: Role,
  onAdded(index: number): void,
}) {
  const [side, update] = useSide(props.side);
  const counters = countersByNation[side.nation] ?? {};
  return <>
    {Object.keys(counters).map(unitName).map(name =>
      <img src={unitUrl(name)}
           style={{width: `${size}mm`, cursor: 'pointer', boxShadow: sideRing(props.side)}}
           alt={`${name}`}
           onClick={() => {
             update('units')(prev => [...prev, {def: name, losses: 0}]);
             props.onAdded(side.units.length);
           }}/>
    )}
  </>;
}

/** 10.0 Step Loss markers, placed under the selected unit of the active side */
export function StepLosses(props: {
  side: Role | undefined,
  selected: number | undefined,
}) {
  const [side, update] = useSide(props.side ?? 'attacker');
  const selectedUnit = props.side === undefined || props.selected === undefined ? undefined : side.units[props.selected];
  const setLosses = (losses: number) => update('units')(prev => prev.map((unit, idx) =>
    idx === props.selected ? {...unit, losses: unit.losses === losses ? 0 : losses} : unit));
  return <>
    {stepLosses.map(losses =>
      <img src={stepLossUrl(losses)}
           style={{
             width: `${size}mm`,
             cursor: 'pointer',
             opacity: selectedUnit ? 1 : 0.4,
             boxShadow: props.side && selectedUnit ? sideRing(props.side) : undefined,
             outline: selectedUnit?.losses === losses ? '2px solid blue' : undefined,
           }}
           alt={`${losses}`}
           onClick={() => selectedUnit && setLosses(losses)}/>
    )}
  </>;
}
