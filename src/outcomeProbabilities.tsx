import * as R from "remeda";

const rolls = R.range(1, 7).flatMap(tens => R.range(1, 7).map(units => tens * 10 + units));

function distribution(outcome: (roll: number) => string | undefined) {
  return R.pipe(
    rolls,
    R.map(outcome),
    R.filter(R.isDefined),
    R.countBy(R.identity()),
    R.entries(),
    R.map(([label, count]) => ({label, p: count / rolls.length})),
  );
}

function ProbabilityTable(props: {
  title: string,
  outcome(roll: number): string | undefined,
  current: string | undefined,
}) {
  const rows = distribution(props.outcome);
  return <table style={{fontSize: 11, borderCollapse: 'collapse'}}>
    <thead>
    <tr>
      <th colSpan={3} style={{textAlign: 'left'}}>{props.title}</th>
    </tr>
    </thead>
    <tbody>{rows.map(({label, p}) => {
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
  fireResult(roll: number): string,
  moraleResult: ((roll: number) => string | undefined) | undefined,
  currentFireResult: string | undefined,
  currentMoraleResult: string | undefined,
}) {
  return <div style={{display: 'flex', alignItems: 'flex-start'}}>
    <ProbabilityTable title="Fire" outcome={props.fireResult} current={props.currentFireResult}/>
    {props.moraleResult &&
      <ProbabilityTable title="Morale (if checked)" outcome={props.moraleResult} current={props.currentMoraleResult}/>}
  </div>;
}
