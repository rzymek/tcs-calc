export function FireOutcome(props: {
  rolled: boolean,
  fireResult: string,
  moraleResult: string | undefined,
}) {
  if (!props.rolled) {
    return <div style={{fontSize: 14}}>Roll the dice</div>;
  }
  const stepLosses = Number(props.fireResult.match(/^-(\d+) step/)?.[1] ?? 0);
  const moraleCheck = props.fireResult !== 'No Effect';
  const line = (label: string, value: string, color?: string) =>
    <div><span style={{fontSize: 11}}>{label}: </span><b style={{color}}>{value}</b></div>;
  return <div style={{fontSize: 16, display: 'flex', flexDirection: 'column', gap: '1mm'}}>
    {line('Step losses', String(stepLosses), stepLosses > 0 ? '#c00' : undefined)}
    {line('Morale check', moraleCheck ? 'yes' : 'no')}
    {line('Morale', props.moraleResult ?? 'none (no unit checks)')}
  </div>;
}