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
import {fireTable} from "./firetable.ts";
import {morale} from "./morale.ts";
import {effectiveMorale2} from "./effectiveMorale2.tsx";
import {FireExplanation} from "./fireExplanation.tsx";
import {FireOutcome} from "./fireOutcome.tsx";
import {Input2D6} from "./input2D6.tsx";

export function MainLayout() {
  const {state} = useContext(Context);
  const [dice, setDice] = useState(0);
  const [view, setView] = useState<'main' | 'info'>('main');
  const [attackingUnits, defendingUnits] = state.attackingSide === 'Britain' ? units : R.pipe(units, R.reverse());

  const resolvedFire = fireResolution(state)
  const input = fireTableInput(resolvedFire);
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
      ${2 * (size + 1) + 1}mm 
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
    </SelectedImages>
    <div style={{
      ...wide,
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '3mm',
      overflowY: 'auto',
      padding: '1mm',
    }}>
      <Input2D6 value={dice} onChange={setDice}/>
      <FireOutcome rolled={dice > 0} fireResult={result} moraleResult={moraleResult?.result}/>
    </div>
    <div style={{
      position: 'fixed',
      right: '2mm',
      bottom: '2mm',
      display: 'flex',
      flexDirection: 'column',
      gap: '1mm'
    }}>
      <SwitchSidesButton/>
      <InfoButton onClick={() => setView('info')}/>
    </div>
  </div>
}
