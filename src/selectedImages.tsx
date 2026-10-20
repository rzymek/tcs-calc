import {useSide} from "./useSide.tsx";
import {cell} from "./mainLayoutCell.tsx";
import {bgColor} from "./bgColor.tsx";
import {size} from "./size.tsx";
import {stepLossUrl, unitUrl} from "./units.tsx";
import {Role} from "./state.ts";
import {CSSProperties} from "preact/compat";

export function SelectedImages(props: {
  side: Role,
  selected: number | undefined,
  onSelect(index: number | undefined): void,
  style?: CSSProperties,
}) {
  const [side, updateSide] = useSide(props.side);
  // the first click selects the unit for step losses, the second one removes it
  const onClick = (idx: number) => {
    if (idx !== props.selected) {
      props.onSelect(idx);
      return;
    }
    updateSide('units')(prev => prev.filter((_, i) => i !== idx));
    props.onSelect(undefined);
  };
  return <div style={{...cell, background: bgColor[props.side], position: 'relative', padding: '1mm', gap: '1mm', ...(props.style || {})}}>
    {side.units.map((unit, idx) =>
      <div key={idx}
           style={{
             position: 'relative',
             cursor: 'pointer',
             height: 'fit-content',
             outline: idx === props.selected ? '2px solid blue' : undefined,
           }}
           onClick={() => onClick(idx)}>
        <img src={unitUrl(unit.def)} style={{width: `${size}mm`, display: 'block'}} alt={`${unit.def}`}/>
        {unit.losses > 0 && <img src={stepLossUrl(unit.losses)}
                                 style={{position: 'absolute', right: '-1mm', bottom: '-1mm', width: `${size / 2}mm`}}
                                 alt={`-${unit.losses}`}/>}
      </div>
    )}
  </div>;
}