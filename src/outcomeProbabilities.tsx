import * as R from "remeda";
import {rolls2d6} from "./tcs/dice.ts";
import {FireResult} from "./tcs/firetable.ts";
import {moraleDistribution} from "./tcs/moraleCheck.ts";

type Rows = { label: string, p: number }[];

export function distribution(outcome: (roll: number) => string | undefined): Rows {
  return R.pipe(
    rolls2d6,
    R.map(outcome),
    R.filter(R.isDefined),
    R.countBy(R.identity()),
    R.entries(),
    R.map(([label, count]) => ({label, p: count / rolls2d6.length})),
  );
}

function ProbabilityTable(props: {
  title: string,
  rows: Rows,
  current?: string,
}) {
  return <table style={{fontSize: 11, borderCollapse: 'collapse'}}>
    <thead>
    <tr>
      <th colSpan={3} style={{textAlign: 'left'}}>{props.title}</th>
    </tr>
    </thead>
    <tbody>{props.rows.map(({label, p}) => {
      const isCurrent = label === props.current;
      return <tr key={label} style={{fontWeight: isCurrent ? 'bold' : 'normal'}}>
        <td style={{paddingRight: '1mm', whiteSpace: 'nowrap'}}>{label}</td>
        <td style={{textAlign: 'right', paddingRight: '1mm'}}>{Math.round(p * 100)}%</td>
        <td style={{width: '15mm'}}>
          <div style={{
            width: `${p * 100}%`,
            height: '2mm',
            background: isCurrent ? '#c00' : '#888',
          }}/>
        </td>
      </tr>;
    })}</tbody>
  </table>;
}

export function OutcomeProbabilities(props: {
  fireResult(roll: number): FireResult,
  /** Morale for a Morale Check after the given step losses, undefined if the fire requires no Morale Check */
  moraleTotal: ((newLosses: number) => number | undefined) | undefined,
  currentFireResult: FireResult | undefined,
}) {
  const current = props.currentFireResult;
  const moraleRows = props.moraleTotal && (current === undefined
    ? moraleDistribution(props.fireResult, props.moraleTotal)
    : moraleDistribution(() => current, props.moraleTotal));
  return <div style={{display: 'flex', alignItems: 'flex-start'}}>
    <ProbabilityTable title="Fire" rows={distribution(props.fireResult)} current={current}/>
    {moraleRows &&
      <ProbabilityTable title="Morale" rows={moraleRows}/>}
  </div>;
}
