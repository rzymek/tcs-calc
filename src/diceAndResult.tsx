import {wide} from "./mainLayoutCell.tsx";
import {Input2D6} from "./input2D6.tsx";
import {OutcomeProbabilities} from "./outcomeProbabilities.tsx";
import {fireTable, FiretableInput} from "./firetable.ts";
import {morale} from "./morale.ts";

export function DiceAndResult(props: {
  dice: number,
  onDiceChange(v: number): void,
  fireInput: FiretableInput,
  effectiveMorale: number | undefined,
}) {
  const {effectiveMorale} = props;
  const fireResult = (roll: number) => fireTable.result(props.fireInput, roll);
  const moraleResult = effectiveMorale === undefined
    ? undefined
    : (roll: number) => morale(effectiveMorale, roll).result;
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
    <Input2D6 value={props.dice} onChange={props.onDiceChange}/>
    <OutcomeProbabilities
      fireResult={fireResult}
      moraleResult={moraleResult}
      currentFireResult={rolled ? fireResult(props.dice) : undefined}
      currentMoraleResult={rolled ? moraleResult?.(props.dice) : undefined}/>
  </div>;
}
