import {useContext} from "preact/compat";
import "./app.css";
import * as R from "remeda";
import {Context} from "./context.tsx";
import {size} from "./size.tsx";
import {SwitchSidesButton} from "./switchSidesButton.tsx";
import {wide} from "./mainLayoutCell.tsx";
import {TerrainSelector} from "./terrainSelector.tsx";
import {steps, Units, units} from "./units.tsx";
import {RangeSelector} from "./rangeSelector.tsx";
import {SelectedImages} from "./selectedImages.tsx";
import {Modifiers} from "./modifiers.tsx";

export function MainLayout() {
  const {state} = useContext(Context);
  const [attackingUnits, defendingUnits] = state.attackingSide === 'Britain' ? units : R.pipe(units, R.reverse());

  return <div style={{
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: `1fr 1fr`,
    gridTemplateRows: `
      2fr 
      ${size + 2}mm 
      ${2 * (size + 2)}mm 
      ${size}mm 
      ${size}mm 
      2fr 
      1fr
    `,
  }}>
    <Units side="attacker" field='units' units={attackingUnits}/>
    <Units side="defender" field='units' units={defendingUnits}/>
    <Units side="attacker" field='stepLosses' units={steps}/>
    <Units side="defender" field='stepLosses' units={steps}/>
    <Modifiers/>
    <TerrainSelector/>
    <RangeSelector/>
    <SelectedImages side='attacker'/>
    <SelectedImages side='defender'>
      <SwitchSidesButton/>
    </SelectedImages>
    <div style={{...wide, display: 'block', overflowY: 'auto', whiteSpace: 'pre', fontSize: 10}}>{
      JSON.stringify(state, null, 2)
    }</div>
  </div>
}

