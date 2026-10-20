import {CSSProperties, PropsWithChildren, useContext, useEffect, useRef} from "preact/compat";
import * as R from "remeda";
import {Context} from "./context.tsx";
import {State} from "./state.ts";
import {AreaFire, Fire, fireResolution, fireTableInput, PointFire} from "./tcs/fireResolution.ts";
import {fireResultLosses, fireTable, firetable, pColumnLabels, rawColumns} from "./tcs/firetable.ts";
import {moraleTable} from "./tcs/morale.ts";
import {moraleBreakdown} from "./tcs/moraleCheck.ts";
import {
  areaFireRangeModifiers,
  areaTargetStackingModifiers,
  includesLowTrajectory,
  rowOf
} from "./tcs/areaFire.ts";
import {postures, rowByTerrainType, spottedTable, unspottedTable} from "./tcs/targetTerrainPosture.ts";
import {otherModifiersCandidates} from "./tcs/otherModifiers.ts";
import {baseSpottingRange, spottingColumns} from "./tcs/spotting.ts";
import {activeFirers} from "./tcs/firers.ts";
import {differentialModifiers, differentialRow, pointFireRangeModifiers} from "./tcs/pointFire.ts";
import {GameRules, RangeCategory} from "./tcs/gameRules.ts";
import {TableModifier} from "./tcs/state.ts";
import {remainingSteps, UnitDef, unitStats} from "./tcs/unit.ts";
import {unitUrl} from "./units.tsx";
import {parseRange} from "./parseRange.tsx";
import {BackButton} from "./switchSidesButton.tsx";

type SectionProps<F extends Fire = Fire> = { state: State, fire: F, rules: GameRules };

// look & feel of the TCS player aid sheets
const yellow = '#fff36b';
const selected = '#bcd4ff';
const serif = '"Times New Roman", Times, serif';
const display = '"Copperplate Gothic Bold", Copperplate, "Rockwell Extra Bold", Georgia, serif';
const resolved: CSSProperties = {outline: '2px solid #c00', outlineOffset: '-2px', fontWeight: 'bold'};
const table: CSSProperties = {borderCollapse: 'collapse', fontFamily: serif, fontSize: 12, width: '100%'};
const th: CSSProperties = {fontWeight: 'normal', borderBottom: '1px solid black', padding: '0 1mm', whiteSpace: 'nowrap'};
const td: CSSProperties = {padding: '0.3mm 1mm', textAlign: 'center', whiteSpace: 'nowrap'};
const sticky: CSSProperties = {position: 'sticky', left: 0, zIndex: 1, background: 'white', textAlign: 'left', fontWeight: 'bold'};
const note: CSSProperties = {fontFamily: serif, fontSize: 11, margin: '1mm 0 0'};
const full: CSSProperties = {gridColumn: '1 / -1'};

// en dash for negatives, as printed on the sheets
const signed = (n: number) => n > 0 ? `+${n}` : n < 0 ? `–${-n}` : '0';

function cellBg(stripe: number, isSelected: boolean): CSSProperties {
  if (isSelected) {
    return {backgroundColor: selected};
  }
  return {backgroundColor: stripe % 2 === 0 ? yellow : 'white'};
}

function Box(props: PropsWithChildren<{ title: string, yellowTitle?: boolean, style?: CSSProperties }>) {
  return <section style={{border: '1px solid black', padding: '1.5mm', background: 'white', minWidth: 0, ...props.style}}>
    <h2 style={{
      margin: '0 0 1mm',
      fontFamily: display,
      fontWeight: 900,
      textTransform: 'uppercase',
      fontSize: 16,
      lineHeight: 1.1,
      display: 'inline-block',
      background: props.yellowTitle ? yellow : undefined,
      padding: props.yellowTitle ? '0.5mm 2mm' : undefined,
    }}>{props.title}</h2>
    {props.children}
  </section>;
}

function Result(props: PropsWithChildren) {
  return <div style={{
    marginTop: '1mm',
    fontFamily: serif,
    fontSize: 13,
    background: yellow,
    border: '1px solid black',
    padding: '0.5mm 1.5mm',
    display: 'inline-block',
  }}>{props.children}</div>;
}

function UnitImg(props: { def: UnitDef }) {
  return <img src={unitUrl(props.def)} style={{width: '8mm', verticalAlign: 'middle'}} alt={`${props.def}`}/>;
}

// horizontally scrollable; centers the element marked with data-focus
function Scroll(props: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    const target = container?.querySelector('[data-focus]');
    if (!container || !target) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    container.scrollLeft += targetRect.left - containerRect.left - (containerRect.width - targetRect.width) / 2;
  });
  return <div ref={ref} style={{overflowX: 'auto'}}>{props.children}</div>;
}

function ModifierList(props: { modifiers: TableModifier[] }) {
  return <table style={table}>
    <tbody>{props.modifiers.map((it, idx) =>
      <tr style={{opacity: it.applies ? 1 : 0.45, fontWeight: it.applies ? 'bold' : undefined}}>
        <td style={{...td, ...cellBg(idx, it.applies), width: '8mm'}}>{signed(it.value)}</td>
        <td style={{...td, ...cellBg(idx, it.applies), textAlign: 'left'}}>{it.description}</td>
      </tr>
    )}</tbody>
  </table>;
}

function firingStats(fire: Fire) {
  return activeFirers(fire.firers).map(it => it.stats);
}

function Firers({fire, rules}: SectionProps) {
  const area = fire.type === 'area';
  return <Box title={area ? 'Fire Strength' : 'P-Fire Steps'}>
    <table style={table}>
      <thead>
      <tr><th style={th}>Firer</th><th style={th}>{area ? 'Strength' : 'Steps'}</th><th style={th}/></tr>
      </thead>
      <tbody>{fire.firers.map(({unit, stats, steps, restriction}, idx) => {
        const firing = restriction === undefined;
        return <tr style={{opacity: firing ? 1 : 0.45}}>
          <td style={{...td, ...cellBg(idx, firing)}}><UnitImg def={unit.def}/></td>
          <td style={{...td, ...cellBg(idx, firing), fontWeight: firing ? 'bold' : undefined}}>
            {area ? rules.areaFireStrength(stats, steps) : steps}
          </td>
          <td style={{...td, ...cellBg(idx, firing), whiteSpace: 'normal', textAlign: 'left', fontSize: 10}}>
            {restriction ?? (area && stats.firerType === 'point' ? 'P-firer [11.1d]' : '')}
          </td>
        </tr>;
      })}</tbody>
    </table>
    {fire.firers.length === 0 && <p style={note}>No firing units selected.</p>}
    <Result>
      {fire.type === 'area'
        ? <>Area Fire Strength: <b>{fire.firepower}</b></>
        : <>P-Fire steps: <b>{fire.pSteps}</b></>}
    </Result>
  </Box>;
}

function InfFirepower({state, fire}: SectionProps<AreaFire>) {
  const rows = [
    {range: 0, label: '# Inf steps'},
    {range: 1, label: '1/2 Inf steps'},
  ];
  return <Box title="Inf Firepower">
    <table style={table}>
      <thead>
      <tr><th style={th}>Range</th><th style={th}>Add to Fire Strength <i>(not shifts!)</i></th></tr>
      </thead>
      <tbody>{rows.map((row, idx) => {
        const isSelected = state.distance === row.range;
        return <tr>
          <td style={{...td, ...cellBg(idx, isSelected)}}>{row.range}</td>
          <td style={{...td, ...cellBg(idx, isSelected), ...(isSelected ? resolved : {})}}>{row.label}</td>
        </tr>;
      })}</tbody>
    </table>
    <p style={note}>Firing Inf steps: {fire.firerInfSteps}, range {state.distance}</p>
    <Result>
      Fire Strength {fire.firepower} + {fire.infFirepower} = <b>{fire.firepower + fire.infFirepower}</b>
    </Result>
  </Box>;
}

const spottingLabels: Record<number, string> = {
  3: 'A-target, AT',
  4: 'IG, AA, Arty',
  8: 'Vehicle, Carrier',
};

function Spotting({state, fire}: SectionProps) {
  const rangeLabel = (range: number) => isFinite(range) ? String(range) : 'unlimited';
  return <Box title="Spotting Range">
    <Scroll>
      <table style={table}>
        <tbody>
        <tr>{spottingColumns.map((range, idx) => {
          const isSelected = range === fire.spotting.range;
          return <td style={{
            ...td,
            ...cellBg(idx, isSelected),
            ...(isSelected ? resolved : {}),
            verticalAlign: 'top',
            ...(range === fire.spotting.base && !isSelected ? {outline: '1px dashed black', outlineOffset: '-2px'} : {}),
          }} data-focus={isSelected || undefined}>
            <div style={{fontWeight: 'bold', fontFamily: 'Arial, sans-serif'}}>{rangeLabel(range)}</div>
            <div style={{fontSize: 10, whiteSpace: 'normal'}}>{spottingLabels[range]}</div>
          </td>;
        })}</tr>
        </tbody>
      </table>
    </Scroll>
    <table style={{...table, marginTop: '1mm'}}>
      <tbody>{state.defender.units.filter(unit => remainingSteps(unit) > 0).map((unit, idx) =>
        <tr>
          <td style={{...td, ...cellBg(idx, false)}}><UnitImg def={unit.def}/></td>
          <td style={{...td, ...cellBg(idx, false)}}>{baseSpottingRange(unitStats(unit.def))}</td>
        </tr>
      )}</tbody>
    </table>
    <p style={note}>Use the unit producing the LONGEST Spotting Range [7.1e]. Shifts:</p>
    <ModifierList modifiers={fire.spotting.shifts}/>
    <Result>
      Range {state.distance} {fire.spotted ? '≤' : '>'} {rangeLabel(fire.spotting.range)}:{' '}
      <b>{fire.spotted ? 'Spotted' : 'Unspotted'}</b>
      {fire.noLOS && <> — <b style={{color: '#c00'}}>No LOS</b></>}
    </Result>
  </Box>;
}

function AreaTargetStacking({fire}: SectionProps<AreaFire>) {
  const rows = Object.entries(areaTargetStackingModifiers);
  const contains = (key: string) => {
    const {from, to} = parseRange(key);
    return from <= fire.targetSteps && fire.targetSteps <= to;
  };
  const raw = rows.find(([key]) => contains(key))?.[1];
  return <Box title="Area Target Stacking">
    <table style={table}>
      <thead>
      <tr><th style={th}>Steps</th><th style={th}>Modifier</th></tr>
      </thead>
      <tbody>{rows.map(([key, value], idx) => {
        const isSelected = contains(key);
        return <tr>
          <td style={{...td, ...cellBg(idx, isSelected)}}>{key}</td>
          <td style={{...td, ...cellBg(idx, isSelected), ...(isSelected ? resolved : {})}}>
            {signed(value)}{value < 0 ? '*' : ''}
          </td>
        </tr>;
      })}</tbody>
    </table>
    <p style={note}>Target steps: {fire.targetSteps} (excluding Point targets and immune B-1 targets)</p>
    {raw !== undefined && raw < 0 && fire.areaTargetStacking === 0 &&
      <p style={note}>*Applies only to unspotted SFAs that include any Low-Trajectory firers.</p>}
    <Result>Shift: <b>{signed(fire.areaTargetStacking)}</b></Result>
  </Box>;
}

const areaFireRangeRows = [
  ['inf', 'Inf'],
  ['low', 'Low'],
  ['high', 'High'],
  ['mrt', 'Mortar'],
] as const;

function AreaFireRange({state, fire}: SectionProps<AreaFire>) {
  const columns = Object.entries(areaFireRangeModifiers);
  const usedRows = new Set(firingStats(fire).map(rowOf));
  const contains = (key: string) => {
    const {from, to} = parseRange(key);
    return from <= state.distance && state.distance <= to;
  };
  return <Box title="Area Fire Range">
    <Scroll>
      <table style={table}>
        <thead>
        <tr>
          <th style={th}>Range</th>
          {columns.map(([key]) => <th style={{...th, ...(contains(key) ? cellBg(1, true) : {})}}>{key}</th>)}
        </tr>
        </thead>
        <tbody>{areaFireRangeRows.map(([row, label], idx) => {
          const used = usedRows.has(row);
          return <tr style={{fontWeight: used ? 'bold' : undefined}}>
            <td style={{...td, ...cellBg(idx, used)}}>{label}</td>
            {columns.map(([key, column]) => {
              const isSelected = used && contains(key);
              const isResolved = isSelected && column[row] === fire.areaFireRange;
              return <td style={{...td, ...cellBg(idx, used || contains(key)), ...(isResolved ? resolved : {})}}>
                {signed(column[row])}
              </td>;
            })}
          </tr>;
        })}</tbody>
      </table>
    </Scroll>
    <p style={note}>Apply the one that most favors the defender.</p>
    <Result>Shift: <b>{signed(fire.areaFireRange)}</b></Result>
  </Box>;
}

const rangeCategories: [RangeCategory, string][] = [
  ['close', 'Close'],
  ['nominal', 'Nominal'],
  ['long', 'Long'],
];

function PointFireRange({state, fire, rules}: SectionProps<PointFire>) {
  const used = new Set(firingStats(fire).map(unit => rules.pointFireRange(unit, state.distance)));
  return <Box title="Point Fire Range">
    <table style={table}>
      <thead>
      <tr><th style={th}>Range</th><th style={th}>Modifier</th></tr>
      </thead>
      <tbody>{rangeCategories.map(([category, label], idx) => {
        const value = pointFireRangeModifiers[category];
        const isUsed = used.has(category);
        return <tr style={{fontWeight: isUsed ? 'bold' : undefined}}>
          <td style={{...td, ...cellBg(idx, isUsed)}}>{label}</td>
          <td style={{...td, ...cellBg(idx, isUsed), ...(isUsed && value === fire.pointFireRange ? resolved : {})}}>
            {signed(value)}
          </td>
        </tr>;
      })}</tbody>
    </table>
    <p style={note}>
      Close: up to ½ printed range (rounded up), Nominal: up to printed range, Long: up to twice the printed range.
      Apply the one that favors the defender most.
    </p>
    <Result>Shift: <b>{signed(fire.pointFireRange)}</b></Result>
  </Box>;
}

function Differential({fire}: SectionProps<PointFire>) {
  const {differential} = fire;
  const row = differentialRow(differential.value);
  return <Box title="Differential">
    <table style={table}>
      <thead>
      <tr><th style={th}>Differential</th><th style={th}>Modifier</th></tr>
      </thead>
      <tbody>{differentialModifiers.map(([label, value], idx) =>
        <tr>
          <td style={{...td, ...cellBg(idx, idx === row)}}>{label}</td>
          <td style={{...td, ...cellBg(idx, idx === row), ...(idx === row ? resolved : {})}}>
            {value === undefined ? 'not allowed' : signed(value)}
          </td>
        </tr>
      )}</tbody>
    </table>
    <p style={note}>
      Lowest P-Fire strength {differential.firerStrength} minus best P-defense {differential.targetDefense}
      {' '}= {signed(differential.value)}
    </p>
    <Result>Shift: <b>{differential.shift === undefined ? 'not allowed' : signed(differential.shift)}</b></Result>
  </Box>;
}

const terrainRows = [
  ['billiard', 'Billiard Table'],
  ['open', 'Open'],
  ['partly', 'Partly Protective'],
  ['protective', 'Protective'],
] as const;
const postureColumns = [
  ['moving', 'Move'],
  ['fire', 'Fire'],
  ['dugin', 'Dug In'],
] as const;

function TargetTerrainPosture({state, fire}: SectionProps) {
  const terrainRow = rowByTerrainType[state.terrain.type];
  const activePostures = postures(state.defender);
  const spottedValues = fire.type === 'point' || fire.spotted || !includesLowTrajectory(firingStats(fire));
  const hasTargets = fire.targetSteps > 0;
  return <Box title="Target Terrain / Posture">
    <table style={table}>
      <thead>
      <tr>
        <th style={th}>Terrain</th>
        {postureColumns.map(([posture, label]) =>
          <th style={{...th, ...(activePostures.includes(posture) ? cellBg(1, true) : {})}}>{label}</th>)}
      </tr>
      </thead>
      <tbody>{terrainRows.map(([row, label], idx) => {
        const rowSelected = row === terrainRow;
        return <tr>
          <td style={{...td, ...cellBg(idx, rowSelected), fontWeight: rowSelected ? 'bold' : undefined}}>{label}</td>
          {postureColumns.map(([posture], col) => {
            const isSelected = rowSelected && activePostures.includes(posture);
            const vehicleNote = row === 'billiard' && col < 2 ? '*' : '';
            return <td style={{
              ...td,
              ...cellBg(idx, rowSelected || activePostures.includes(posture)),
              ...(isSelected && hasTargets ? resolved : {}),
            }}>
              <span style={{opacity: spottedValues ? 1 : 0.5}}>{signed(spottedTable[row][col])}{vehicleNote}</span>
              {' '}
              <b style={{opacity: spottedValues ? 0.5 : 1}}>{signed(unspottedTable[row][col])}</b>
            </td>;
          })}
        </tr>;
      })}</tbody>
    </table>
    <p style={note}>
      <b>Bold number:</b> unspotted SFA with any Low-Trajectory firer
      {!spottedValues && <> — <b>applies</b></>}<br/>
      *+2 Move, +4 Fire for Vehicles and Carriers.<br/>
      Terrain: {state.terrain.name} ({state.terrain.type}).
      If more than one posture, apply the one that least favors the defender.
    </p>
    {!hasTargets && <p style={note}>No targets in the hex.</p>}
    <Result>Shift: <b>{signed(fire.targetTerrainPosture)}</b></Result>
  </Box>;
}

function OtherModifiers({state, fire}: SectionProps) {
  return <Box title="Other Modifiers">
    <ModifierList modifiers={otherModifiersCandidates(state, firingStats(fire))}/>
    <p style={note}>
      All Suppressed/Paralyzed not at range 0. P-2+ target in hex: Low-Trajectory Area Fire only (tank cover).
    </p>
    <Result>Shift: <b>{signed(fire.otherModifiers.total)}</b></Result>
  </Box>;
}

function shiftsOf(fire: Fire): [string, number][] {
  if (fire.type === 'area') {
    return [
      ['Area Target Stacking', fire.areaTargetStacking],
      ['Area Fire Range', fire.areaFireRange],
      ['Target Terrain / Posture', fire.targetTerrainPosture],
      ['Other Modifiers', fire.otherModifiers.total],
    ];
  }
  return [
    ['Target Terrain / Posture', fire.targetTerrainPosture],
    ['Point Fire Range', fire.pointFireRange],
    ['Differential', fire.differential.shift ?? 0],
    ['Other Modifiers', fire.otherModifiers.total],
  ];
}

function FireTable({fire, dice}: SectionProps & { dice: number }) {
  const input = fireTableInput(fire);
  if (input === undefined) {
    return <Box title="Fire Table" yellowTitle style={full}>
      <Result><b style={{color: '#c00'}}>{fire.restriction}</b></Result>
    </Box>;
  }
  const rawColumn = fireTable.column({...input, shift: 0});
  const column = fireTable.column(input);
  const result = fireTable.result(input, dice);
  return <Box title="Fire Table" yellowTitle style={full}>
    <table style={{...table, width: 'auto'}}>
      <tbody>
      {shiftsOf(fire).map(([label, value], idx) =>
        <tr>
          <td style={{...td, ...cellBg(idx, false), textAlign: 'left'}}>{label}</td>
          <td style={{...td, ...cellBg(idx, false)}}>{signed(value)}</td>
        </tr>)}
      <tr>
        <td style={{...td, borderTop: '1px solid black', textAlign: 'left', fontWeight: 'bold'}}>Total shift</td>
        <td style={{...td, borderTop: '1px solid black', fontWeight: 'bold'}}>{signed(input.shift)}</td>
      </tr>
      </tbody>
    </table>
    <Scroll>
      <table style={{...table, marginTop: '1mm'}}>
        <thead>
        {([['A-Fire', rawColumns], ['P-Fire', pColumnLabels]] as const).map(([label, labels]) =>
          <tr>
            <th style={{...th, ...sticky, background: yellow}}>{label}</th>
            {labels.map((it, idx) => <th style={{
              ...th,
              ...cellBg(0, idx === column.index),
              fontWeight: idx === column.index ? 'bold' : 'normal',
              outline: idx === rawColumn.index ? '1px dashed black' : undefined,
              outlineOffset: '-2px',
            }} data-focus={(label === 'A-Fire' && idx === column.index) || undefined}>{it ?? ''}</th>)}
          </tr>
        )}
        </thead>
        <tbody>{firetable.map(([label, ...cells], rowIdx) =>
          <tr>
            <td style={{...td, ...sticky}}>{label}</td>
            {rawColumns.map((_, idx) => {
              const isResolved = idx === column.index && label === result && dice > 0;
              return <td style={{
                ...td,
                ...cellBg(rowIdx + 1, idx === column.index),
                ...(isResolved ? resolved : {}),
              }}>{cells[idx] ?? ''}</td>;
            })}
          </tr>
        )}</tbody>
      </table>
    </Scroll>
    <p style={note}>
      {fire.type === 'area'
        ? <><b>For Area Fires:</b> Total Area Fire Strength Points.
          All results other than No Effect require a <b>Morale Check</b>.</>
        : <><b>For Point Fires:</b> Total Point Fire STEPS, not Strength Points.
          The number is the number of targets destroyed (target steps: {fire.targetSteps}).</>}
    </p>
    <Result>
      {'firepower' in input ? `Strength ${input.firepower}` : `P-steps ${input.pSteps}`} → column {rawColumn.label},
      shift {signed(input.shift)} → column <b>{column.label}</b>; roll {dice > 0 ? dice : '–'}:{' '}
      <b>{dice > 0 ? result : '–'}</b>
    </Result>
  </Box>;
}

function MoraleTable({state, fire, rules, dice}: SectionProps & { dice: number }) {
  const input = fireTableInput(fire);
  if (input === undefined) {
    return null;
  }
  if (!fire.moraleCheck) {
    return <Box title="Morale Table" yellowTitle style={full}>
      <p style={note}>Point Fires never cause Morale Checks [12.2f].</p>
    </Box>;
  }
  const fireResult = dice > 0 ? fireTable.result(input, dice) : undefined;
  const newLosses = fireResult === undefined ? 0 : fireResultLosses(fireResult);
  const breakdown = moraleBreakdown(state, firingStats(fire), rules, newLosses ?? 0);
  if (breakdown === undefined) {
    return <Box title="Morale Table" yellowTitle style={full}>
      <p style={note}>No unit in the target hex checks Morale (Vehicles and Carriers never do).</p>
    </Box>;
  }
  const mods = R.sumBy(breakdown.modifiers.filter(it => it.applies), it => it.value);
  const column = R.clamp(breakdown.total, {min: 1, max: 13});
  const header = (idx: number) => idx === 1 ? '1 or less' : idx === 13 ? '13+' : String(idx);
  return <>
    <Box title="Morale Modifiers">
      <ModifierList modifiers={breakdown.modifiers}/>
    </Box>
    <Box title="Morale Table" yellowTitle style={full}>
      <Result>
        <b>Morale</b> (= Unit Morale {breakdown.unitMorale} + Step Losses {breakdown.stepLosses}
        {' '}+ Bn Morale {breakdown.bnMorale} + Mods {signed(mods)}) = <b>{breakdown.total}</b>
      </Result>
      <p style={note}>
        {fireResult === undefined
          ? 'Step losses before the fire. Roll the fire to include its losses.'
          : `Step losses include the fire result (${fireResult}), assigned as in 10.0f.`}
        {' '}The unit with the worst Morale checks for the stack [17.2a].
      </p>
      <Scroll>
        <table style={{...table, marginTop: '1mm'}}>
          <thead>
          <tr>
            <th style={{...th, ...sticky}}>Result</th>
            {R.range(1, 14).map(idx => <th style={{
              ...th,
              ...(idx === column ? cellBg(1, true) : {}),
              fontWeight: idx === column ? 'bold' : 'normal',
            }} data-focus={idx === column || undefined}>{header(idx)}</th>)}
          </tr>
          </thead>
          <tbody>{moraleTable.map(([label, ...cells], rowIdx) =>
            <tr>
              <td style={{...td, ...sticky}}>{label}</td>
              {R.range(1, 14).map(idx => <td style={{
                ...td,
                ...cellBg(rowIdx, idx === column),
              }}>{cells[idx - 1] ?? ''}</td>)}
            </tr>
          )}</tbody>
        </table>
      </Scroll>
      <Result>
        {fireResult === 'No Effect'
          ? <>Fire result is No Effect — no Morale Check needed.</>
          : <>Roll two dice on column <b>{header(column)}</b>.</>}
      </Result>
    </Box>
  </>;
}

function Notes({fire}: SectionProps) {
  if (fire.notes.length === 0) {
    return null;
  }
  return <Box title="Game Rules" style={full}>
    {fire.notes.map(it => <p style={note}>{it}</p>)}
  </Box>;
}

export function FireExplanation(props: { dice: number, rules: GameRules, onBack(): void }) {
  const {state} = useContext(Context);
  const fire = fireResolution(state, props.rules);
  const sectionProps = {state, fire, rules: props.rules};
  return <div style={{position: 'absolute', inset: 0, overflowY: 'auto', background: 'white'}}>
    <div style={{
      maxWidth: '16cm',
      margin: '0 auto',
      padding: `2mm 2mm 20mm`,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(6cm, 1fr))',
      gap: '2mm',
      alignItems: 'start',
    }}>
      <header style={{
        ...full,
        background: 'black',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '1mm 2mm',
      }}>
        <h1 style={{margin: 0, fontFamily: display, fontWeight: 900, textTransform: 'uppercase', fontSize: 22}}>
          {fire.type === 'area' ? 'Area Fire' : 'Point Fire'}
        </h1>
        <span style={{fontFamily: serif, fontVariant: 'small-caps', fontWeight: 'bold', fontSize: 14}}>
          Tactical Combat Series
        </span>
      </header>
      <Firers {...sectionProps}/>
      {fire.type === 'area' && <InfFirepower {...sectionProps} fire={fire}/>}
      <Spotting {...sectionProps}/>
      {fire.type === 'area' && <AreaTargetStacking {...sectionProps} fire={fire}/>}
      {fire.type === 'area' && <AreaFireRange {...sectionProps} fire={fire}/>}
      {fire.type === 'point' && <PointFireRange {...sectionProps} fire={fire}/>}
      {fire.type === 'point' && <Differential {...sectionProps} fire={fire}/>}
      <TargetTerrainPosture {...sectionProps}/>
      <OtherModifiers {...sectionProps}/>
      <Notes {...sectionProps}/>
      <FireTable {...sectionProps} dice={props.dice}/>
      <MoraleTable {...sectionProps} dice={props.dice}/>
    </div>
    <div style={{position: 'fixed', right: '2mm', bottom: '2mm'}}>
      <BackButton onClick={props.onBack}/>
    </div>
  </div>;
}
