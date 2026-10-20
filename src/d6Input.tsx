import {size} from "./size.tsx";
import {range} from "remeda";

// pip positions on a 3x3 grid (0..2), per die face
const pips: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

export function D6Input(props: {
  value?: number;
  color?: string;
  onChange?: (n: number) => void
}) {
  return <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(3, ${size}mm)`,
    gridTemplateRows: `repeat(2, ${size}mm)`,
    gap: '1mm',
  }}>{
    range(1, 7).map(v => {
      const selected = props.value === v;
      return <div key={v}
                  style={{
                    width: `${size}mm`,
                    height: `${size}mm`,
                    boxSizing: 'border-box',
                    border: `solid 1px ${selected ? 'blue' : 'black'}`,
                    outline: selected ? '2px solid blue' : undefined,
                    boxShadow: selected ? '0 0 2mm 0.5mm rgba(0, 0, 255, 0.7)' : undefined,
                    position: 'relative',
                    zIndex: selected ? 1 : undefined,
                    borderRadius: 3,
                    backgroundColor: props.color ?? 'white',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => props.onChange?.(v)}>
        <svg viewBox="0 0 30 30" width="100%" height="100%">
          {pips[v].map(([x, y]) =>
            <circle key={`${x}${y}`} cx={7 + x * 8} cy={7 + y * 8} r={3} fill="black"/>
          )}
        </svg>
      </div>;
    })
  }</div>;
}