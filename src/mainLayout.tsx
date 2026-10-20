import {useContext, useState} from "preact/compat";
import "./app.css";
import * as R from "remeda";
import {Context} from "./context.tsx";
import {size} from "./size.tsx";
import {InfoButton, SwitchSidesButton} from "./switchSidesButton.tsx";
import {wide} from "./mainLayoutCell.tsx";
import {TerrainSelector} from "./terrainSelector.tsx";
import {steps, Units, units} from "./units.tsx";
import {RangeSelector} from "./rangeSelector.tsx";
import {SelectedImages} from "./selectedImages.tsx";
import {Modifiers} from "./modifiers.tsx";
import {fireResolution, fireTableInput} from "./fireResolution.tsx";
import {D6Input} from "./d6Input.tsx";
import {fireTable} from "./firetable.ts";
import {morale} from "./morale.ts";
import {effectiveMorale2} from "./effectiveMorale2.tsx";
import {FireExplanation} from "./fireExplanation.tsx";

function Input2D6(props: { value: number, onChange(v: number): void }) {
  const d6d6 = props.value;
  return <div style={{display: 'flex', gap: '1mm'}}>
    <D6Input color="lightblue" value={Math.floor(d6d6 / 10)} onChange={(v) => props.onChange(v * 10 + d6d6 % 10)}/>
    <D6Input color="lightpink" value={d6d6 % 10} onChange={(v) => props.onChange(d6d6 - d6d6 % 10 + v)}/>
  </div>
}

export function MainLayout() {
  const {state} = useContext(Context);
  const [dice, setDice] = useState(0);
  const [view, setView] = useState<'main' | 'info'>('main');
  const [attackingUnits, defendingUnits] = state.attackingSide === 'Britain' ? units : R.pipe(units, R.reverse());

  const resolvedFire = fireResolution(state)
  const input = fireTableInput(resolvedFire);
  const column = fireTable.column(input)
  const result = fireTable.result(input, dice)
  // TODO: Bn morale input
  const bnMorale = 0;
  const effectiveMorale = effectiveMorale2(state, bnMorale);
  const moraleResult = effectiveMorale === undefined ? undefined : morale(effectiveMorale, dice)
  if (view === 'info') {
    return <FireExplanation dice={dice} bnMorale={bnMorale} onBack={() => setView('main')}/>;
  }
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
      <div style={{
        position: 'absolute',
        right: '2mm',
        bottom: '2mm',
        display: 'flex',
        flexDirection: 'column',
        gap: '1mm'
      }}>
        <SwitchSidesButton/>
        <InfoButton onClick={() => setView('info')}/>
      </div>
    </SelectedImages>
    <div style={{...wide, display: 'block', overflowY: 'auto', whiteSpace: 'pre', padding: '1mm', fontSize: 10}}>
      <Input2D6 value={dice} onChange={setDice}/>
      {JSON.stringify({column, result, moraleResult}, null, 2)}
      {JSON.stringify(resolvedFire, null, 2)}
    </div>
  </div>
}
