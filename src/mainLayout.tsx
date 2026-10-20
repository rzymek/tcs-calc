import {useContext, useEffect, useState} from "preact/compat";
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
import {fireResolution} from "./fireResolution.tsx";
import {D6Input} from "./d6Input.tsx";
import {fireTable} from "./firetable.ts";
import {morale} from "./morale.ts";
import {effectiveMorale2} from "./effectiveMorale2.tsx";

function Input2D6(props: { onChange(v: number): void }) {
  const [d6d6, setD6d6] = useState(0)
  useEffect(() => {
    props.onChange(d6d6)
  }, [props.onChange, d6d6])
  return <div style={{display: 'flex', gap: '1mm'}}>
    <D6Input color="lightblue" value={Math.floor(d6d6 / 10)} onChange={(v) => setD6d6(v * 10 + d6d6 % 10)}/>
    <D6Input color="lightpink" value={d6d6 % 10} onChange={(v) => setD6d6(d6d6 - d6d6 % 10 + v)}/>
  </div>
}

function fireTableInput(fire: ReturnType<typeof fireResolution>) {
  const shift = R.pipe([
    fire.areaTargetStacking,
    fire.areaFireRange,
    fire.targetTerrainPosture,
    fire.otherModifiers.total
  ], R.sum());
  const firepower = fire.firepower + fire.infFirepower;
  return {shift, firepower}
}

export function MainLayout() {
  const {state} = useContext(Context);
  const [dice, setDice] = useState(33);
  const [attackingUnits, defendingUnits] = state.attackingSide === 'Britain' ? units : R.pipe(units, R.reverse());

  const resolvedFire = fireResolution(state)
  const input = fireTableInput(resolvedFire);
  const column = fireTable.column(input)
  const result = fireTable.result(input, dice)
  // TODO: Bn morale input
  const effectiveMorale = effectiveMorale2(state, 0);
  const moraleResult = effectiveMorale === undefined ? undefined : morale(effectiveMorale, dice)
  return <div style={{
    position: 'absolute',
    inset: 0,
    maxWidth: '16cm',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: `1fr 1fr`,
    gridTemplateRows: `
      2fr 
      ${size + 3}mm 
      ${2 * (size + 1) + 1}mm 
      ${size}mm 
      ${size}mm 
      1fr 
      2fr
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
    <div style={{...wide, display: 'block', overflowY: 'auto', whiteSpace: 'pre', padding: '1mm', fontSize: 10}}>
      <Input2D6 onChange={v => setDice(v)}/>
      {JSON.stringify({column, result, moraleResult}, null, 2)}
      {JSON.stringify(resolvedFire, null, 2)}
    </div>
  </div>
}
