import {PropsWithChildren} from "preact/compat";
import {useSide} from "./useSide.tsx";
import {cell} from "./mainLayoutCell.tsx";
import {bgColor} from "./bgColor.tsx";
import {size} from "./size.tsx";
import {unitUrl} from "./units.tsx";
import {UnitDef} from "./unitName.tsx";

const removeAt = (idx: number) => <T, >(prev: T[]) => prev.filter((_, i) => i !== idx);

export function SelectedImages(props: PropsWithChildren<{
  side: 'attacker' | 'defender',
}>) {
  const [side, updateSide] = useSide(props.side);
  const image = (name: UnitDef, onClick: () => void) =>
    <img src={unitUrl(name)}
         style={{width: `${size}mm`, cursor: 'pointer'}}
         alt={`${name}`}
         onClick={onClick}/>;
  return <div style={{...cell, background: bgColor[props.side], position: 'relative'}}>
    {side.units.map((name, idx) =>
      image(name, () => updateSide('units')(removeAt(idx))))}
    {side.stepLosses.map((name, idx) =>
      image(UnitDef.brand(name), () => updateSide('stepLosses')(removeAt(idx))))}
    {props.children}
  </div>;
}