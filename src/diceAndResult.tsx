import {wide} from "./mainLayoutCell.tsx";
import {Input2D6} from "./input2D6.tsx";
import {FireOutcome} from "./fireOutcome.tsx";

export function DiceAndResult(props: {
  dice: number,
  onDiceChange(v: number): void,
  fireResult: string,
  moraleResult: string | undefined,
}) {
  return <div style={{
    ...wide,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '3mm',
    overflowY: 'auto',
    padding: '1mm',
  }}>
    <Input2D6 value={props.dice} onChange={props.onDiceChange}/>
    <FireOutcome rolled={props.dice > 0} fireResult={props.fireResult} moraleResult={props.moraleResult}/>
  </div>;
}
