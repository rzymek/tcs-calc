import {useSide} from "./useSide.tsx";
import {cell} from "./mainLayoutCell.tsx";
import {bgColor} from "./bgColor.tsx";
import {size} from "./size.tsx";
import {UnitDef, unitName} from "./unitName.tsx";

const brit = import.meta.glob<string>(`./images/units/Brit/*.png`, {eager: true, query: '?url', import: 'default'});
const arg = import.meta.glob<string>(`./images/units/Arg/*.png`, {eager: true, query: '?url', import: 'default'});
export const steps = import.meta.glob<string>(`./images/steps/*.png`, {eager: true, query: '?url', import: 'default'});
type UnitImages = typeof brit;

const urlByName: Record<string, string> = Object.fromEntries(
  Object.entries({...brit, ...arg, ...steps}).map(([path, url]) => [unitName(path), url])
);

export function unitUrl(name: UnitDef) {
  return urlByName[UnitDef.unbrand(name)];
}

export function Units(props: {
  field: 'units' | 'stepLosses',
  side: 'attacker' | 'defender',
  units: UnitImages,
}) {
  const [, update] = useSide(props.side);
  return <div style={{...cell, background: bgColor[props.side]}}>
    {Object.keys(props.units).map(unitName).map(name =>
      <img src={unitUrl(name)}
           style={{width: `${size}mm`, cursor: 'pointer'}}
           alt={`${name}`}
           onClick={() => update(props.field)(prev => [...prev, name] as string[])}/>
    )}
  </div>;
}

export const units: UnitImages[] = [brit, arg];
