import {PropsWithChildren} from "preact/compat";
import {useSide} from "./useSide.tsx";
import {cell} from "./mainLayoutCell.tsx";
import {bgColor} from "./bgColor.tsx";
import {size} from "./size.tsx";

export function SelectedImages(props: PropsWithChildren<{
  side: 'attacker' | 'defender',
}>) {
  const [side, updateSide] = useSide(props.side);
  return <div style={{...cell, background: bgColor[props.side], position: 'relative'}}>
    {(['units', 'stepLosses'] as const).flatMap(key =>
      side[key].map((img, idx) =>
        <img src={img}
             style={{width: `${size}mm`, cursor: 'pointer'}}
             alt={img}
             onClick={() => updateSide(key)(prev => prev.filter((_, i) => i !== idx))}/>))}
    {props.children}
  </div>;
}