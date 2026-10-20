import {wide} from "./mainLayoutCell.tsx";
import {Input2D6} from "./input2D6.tsx";
import {OutcomeProbabilities} from "./outcomeProbabilities.tsx";
import {fireTable} from "./tcs/firetable.ts";
import {Fire, fireTableInput} from "./tcs/fireResolution.ts";
import {activeFirers} from "./tcs/firers.ts";
import {moraleBreakdown} from "./tcs/moraleCheck.ts";
import {GameRules} from "./tcs/gameRules.ts";
import {State} from "./state.ts";
import {PropsWithChildren} from "preact/compat";

export function DiceAndResult(props: PropsWithChildren<{
  dice: number,
  onDiceChange(v: number): void,
  state: State,
  fire: Fire,
  rules: GameRules,
}>) {
  const {state, fire, rules} = props;
  const input = fireTableInput(fire);
  const firing = activeFirers(fire.firers).map(it => it.stats);
  const moraleTotal = (newLosses: number) => moraleBreakdown(state, firing, rules, newLosses)?.total;
  const rolled = props.dice > 0;
  return <div style={{
    ...wide,
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'start',
    gap: '3mm',
    overflowY: 'auto',
    padding: '1mm',
  }}>
    <div style={{display: 'flex', gap: '3mm', flexWrap: 'wrap', maxWidth: `${6*(10+1)}mm`}}>
      <Input2D6 value={props.dice} onChange={props.onDiceChange}/>
      {props.children}
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: '1mm', fontSize: 11, flex: 1, minWidth: 0}}>
      {input === undefined
        ? <b style={{color: '#c00'}}>{fire.restriction}</b>
        : <OutcomeProbabilities
          fireResult={roll => fireTable.result(input, roll)}
          moraleTotal={fire.moraleCheck ? moraleTotal : undefined}
          currentFireResult={rolled ? fireTable.result(input, props.dice) : undefined}/>}
      {fire.notes.map(note => <span key={note}>{note}</span>)}
    </div>
  </div>;
}
