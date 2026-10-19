import {useContext} from "preact/compat";
import {Context} from "./context.tsx";
import {wide} from "./mainLayoutCell.tsx";
import * as R from "remeda";
import {size} from "./size.tsx";

export function RangeSelector() {
  const {state, update} = useContext(Context);
  return <div style={{...wide,
    justifyContent: 'start',
  }}>
    {R.range(0, 30 + 1).map(it => <button style={{
      width: `${size}mm`,
      minWidth: `${size}mm`,
      ...(state.distance === it && {background: 'rgb(0,0,255,0.5)', color: 'white'}),
    }} onClick={() => update({distance: it})}>{it}</button>)}
  </div>
}