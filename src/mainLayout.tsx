import {useContext, useEffect, useState} from "preact/compat";
import "./app.css";
import {Context} from "./context.tsx";
import {size} from "./size.tsx";
import {TerrainSelector} from "./terrainSelector.tsx";
import {bagHeight, CounterBag, counterCount, StepLosses, stepLossCount, Units} from "./units.tsx";
import {RangeSelector} from "./rangeSelector.tsx";
import {SelectedImages} from "./selectedImages.tsx";
import {Modifiers} from "./modifiers.tsx";
import {fireResolution} from "./tcs/fireResolution.ts";
import {FireExplanation} from "./fireExplanation.tsx";
import {DiceAndResult} from "./diceAndResult.tsx";
import {FloatingButtons} from "./floatingButtons.tsx";
import {goosegreenRules as rules} from "./goosegreen/rules.ts";
import {initialState, Role} from "./state.ts";
import {BnMoraleButton, FireTypeButton, ResetButton, SwitchSidesButton} from "./switchSidesButton.tsx";

type Selection = Record<Role, number | undefined>;
const noSelection: Selection = {attacker: undefined, defender: undefined};
const maxBnMorale = 6;
const maxWidth = 16; // cm
const pxPerCm = 96 / 2.54;

/** width of the layout in px */
function useLayoutWidth() {
  const measure = () => Math.min(document.documentElement.clientWidth, maxWidth * pxPerCm);
  const [width, setWidth] = useState(measure);
  useEffect(() => {
    const onResize = () => setWidth(measure());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

export function MainLayout() {
  const {state, update} = useContext(Context);
  const {attacker, defender} = state;
  const [dice, setDice] = useState(0);
  const [view, setView] = useState<'main' | 'info'>('main');
  const [selected, setSelected] = useState<Selection>(noSelection);
  // the side whose selected unit receives step losses
  const [active, setActive] = useState<Role>();
  const width = useLayoutWidth();
  const select = (role: Role) => (index: number | undefined) => {
    setSelected(prev => ({...prev, [role]: index}));
    setActive(index === undefined ? undefined : role);
  };
  const switchSides = () => {
    update({attacker: state.defender, defender: state.attacker});
    setSelected(noSelection);
    setActive(undefined);
  };
  const reset = () => {
    update(initialState);
    setDice(0);
    setSelected(noSelection);
    setActive(undefined);
  };

  const fire = fireResolution(state, rules);
  if (view === 'info') {
    return <FireExplanation dice={dice} rules={rules} onBack={() => setView('main')}/>;
  }
  const counters = counterCount(attacker.nation) + counterCount(defender.nation) + stepLossCount;
  return <div style={{
    position: 'absolute',
    inset: 0,
    maxWidth: `${maxWidth}cm`,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: `1fr 1fr`,
    gridTemplateRows: `
      ${bagHeight(counters, width)}
      ${2 * (size + 1) + 1}mm 
      ${size}mm 
      ${size}mm 
      1fr 
      ${1.5 * size + 3}mm
    `,
  }}>
    <CounterBag>
      <Units side="attacker" onAdded={select('attacker')}/>
      <Units side="defender" onAdded={select('defender')}/>
      <StepLosses side={active} selected={active && selected[active]}/>
    </CounterBag>
    <Modifiers/>
    <TerrainSelector/>
    <RangeSelector/>
    <DiceAndResult dice={dice} onDiceChange={setDice} state={state} fire={fire} rules={rules}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1mm'}}>
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
        <ResetButton onClick={reset}/>
      </div>
    </DiceAndResult>
    <SelectedImages side='attacker' selected={selected.attacker} onSelect={select('attacker')}/>
    <SelectedImages side='defender' selected={selected.defender} onSelect={select('defender')}
                    style={{paddingRight: '12mm'}}/>
    <FloatingButtons onInfo={() => setView('info')}/>
  </div>
}
