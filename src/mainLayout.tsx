import {useContext, useState} from "preact/compat";
import "./app.css";
import {Context} from "./context.tsx";
import {size} from "./size.tsx";
import {TerrainSelector} from "./terrainSelector.tsx";
import {StepLosses, Units} from "./units.tsx";
import {RangeSelector} from "./rangeSelector.tsx";
import {SelectedImages} from "./selectedImages.tsx";
import {Modifiers} from "./modifiers.tsx";
import {fireResolution} from "./tcs/fireResolution.ts";
import {FireExplanation} from "./fireExplanation.tsx";
import {DiceAndResult} from "./diceAndResult.tsx";
import {ActionButtons} from "./actionButtons.tsx";
import {goosegreenRules as rules} from "./goosegreen/rules.ts";
import {Role} from "./state.ts";
import {BnMoraleButton, FireTypeButton, SwitchSidesButton} from "./switchSidesButton.tsx";

type Selection = Record<Role, number | undefined>;
const noSelection: Selection = {attacker: undefined, defender: undefined};
const maxBnMorale = 6;

export function MainLayout() {
  const {state, update} = useContext(Context);
  const {defender} = state;
  const [dice, setDice] = useState(0);
  const [view, setView] = useState<'main' | 'info'>('main');
  const [selected, setSelected] = useState<Selection>(noSelection);
  const select = (role: Role) => (index: number | undefined) => setSelected(prev => ({...prev, [role]: index}));
  const switchSides = () => {
    update({attacker: state.defender, defender: state.attacker});
    setSelected(noSelection);
  };

  const fire = fireResolution(state, rules);
  if (view === 'info') {
    return <FireExplanation dice={dice} rules={rules} onBack={() => setView('main')}/>;
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
      ${1.5 * size + 3}mm
    `,
  }}>
    <Units side="attacker" onAdded={select('attacker')}/>
    <Units side="defender" onAdded={select('defender')}/>
    <StepLosses side="attacker" selected={selected.attacker}/>
    <StepLosses side="defender" selected={selected.defender}/>
    <Modifiers/>
    <TerrainSelector/>
    <RangeSelector/>
    <DiceAndResult dice={dice} onDiceChange={setDice} state={state} fire={fire} rules={rules}>
      <FireTypeButton fireType={state.fireType}
                      onClick={() => update({fireType: state.fireType === 'area' ? 'point' : 'area'})}/>
      <BnMoraleButton value={defender.bnMorale}
                      onClick={() => update({
                        defender: {
                          ...defender,
                          bnMorale: (defender.bnMorale + 1) % (maxBnMorale + 1)
                        }
                      })}/>
      <SwitchSidesButton onClick={switchSides}/>

    </DiceAndResult>
    <SelectedImages side='attacker' selected={selected.attacker} onSelect={select('attacker')}/>
    <SelectedImages side='defender' selected={selected.defender} onSelect={select('defender')}
                    style={{paddingRight: '12mm'}}/>
    <ActionButtons onInfo={() => setView('info')}/>
  </div>
}
