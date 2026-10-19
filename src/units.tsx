import {useSide} from "./useSide.tsx";
import {cell} from "./mainLayoutCell.tsx";
import {bgColor} from "./bgColor.tsx";
import {resolveAll} from "./resolveAll.tsx";
import {size} from "./size.tsx";

const brit = import.meta.glob<string>(`./images/units/Brit/*.png`);
const arg = import.meta.glob<string>(`./images/units/Arg/*.png`);
type UnitImages = typeof brit;

export function Units(props: {
  field: 'units' | 'stepLosses',
  side: 'attacker' | 'defender',
  units: UnitImages,
}) {
  const [, update] = useSide(props.side);
  return <div style={{...cell, background: bgColor[props.side]}}>
    {resolveAll(props.units).map(img =>
      <img src={img}
           style={{width: `${size}mm`, cursor: 'pointer'}}
           alt={img}
           onClick={() => update('units')(prev => [...prev, img])}/>
    )}
  </div>;
}

export const units: UnitImages[] = [brit, arg];