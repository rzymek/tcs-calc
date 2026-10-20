import {CSSProperties, PropsWithChildren, useContext, useEffect, useRef} from "preact/compat";
import * as R from "remeda";
import {Context} from "./context.tsx";
import {State} from "./state.ts";
import {fireResolution, fireTableInput} from "./fireResolution.tsx";
import {fireTable, firetable, rawColumns} from "./firetable.ts";
import {morale, moraleTable} from "./morale.ts";
import {moraleBreakdown} from "./effectiveMorale2.tsx";
import {areaTargetStackingModifiers} from "./areaTargetStacking.tsx";
import {areaFireRangeModifiers, rowOf} from "./areaFireRange.tsx";
import {postures, rowByTerrainType, spottedTable, unspottedTable} from "./targetTerrainPosture.tsx";
import {otherModifiersCandidates} from "./otherModifiers.tsx";
import {unitSpottingRange} from "./unitsSpottingRange.tsx";
import {includesLowTrajectory} from "./includesLowTrajectory.tsx";
import {UnitDef, unitStats} from "./unitName.tsx";
import {unitUrl} from "./units.tsx";
import {parseRange} from "./parseRange.tsx";
import {BackButton} from "./switchSidesButton.tsx";

type Fire = ReturnType<typeof fireResolution>;
type SectionProps = { state: State, fire: Fire };

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

function ModifierList(props: { modifiers: { value: number, description: string, applies: boolean }[] }) {
  return <table style={table}>
    <tbody>{props.modifiers.map((it, idx) =>
      <tr style={{opacity: it.applies ? 1 : 0.45, fontWeight: it.applies ? 'bold' : undefined}}>
        <td style={{...td, ...cellBg(idx, it.applies), width: '8mm'}}>{signed(it.value)}</td>
        <td style={{...td, ...cellBg(idx, it.applies), textAlign: 'left'}}>{it.description}</td>
      </tr>
    )}</tbody>
  </table>;
}

function FireStrength({state, fire}: SectionProps) {
  const firers = state.attacker.units.map(def => ({def, stats: unitStats(def)}));
  return <Box title="Fire Strength">
    <table style={table}>
      <thead>
      <tr><th style={th}>Firer</th><th style={th}>Fire type</th><th style={th}>Strength</th></tr>
      </thead>
      <tbody>{firers.map(({def, stats}, idx) => {
        const area = stats.firerType === 'area';
        return <tr style={{opacity: area ? 1 : 0.45}}>
          <td style={{...td, ...cellBg(idx, area)}}><UnitImg def={def}/></td>
          <td style={{...td, ...cellBg(idx, area)}}>{area ? 'Area' : 'Point (ignored)'}</td>
          <td style={{...td, ...cellBg(idx, area), fontWeight: area ? 'bold' : undefined}}>{stats.fireStrength}</td>
        </tr>;
      })}</tbody>
    </table>
    {firers.length === 0 && <p style={note}>No firing units selected.</p>}
    <Result>Area Fire Strength: <b>{fire.firepower}</b></Result>
  </Box>;
}

function InfFirepower({state, fire}: SectionProps) {
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

const spottingColumns = [
  {range: 0}, {range: 1}, {range: 2},
  {range: 3, label: 'A-target'},
  {range: 4, label: 'AT, IG, AA, Arty'},
  {range: 6},
  {range: 8, label: 'Point'},
  {range: 12},
  {range: Infinity, label: 'unlimited'},
];

function Spotting({state, fire}: SectionProps) {
  const rangeLabel = (range: number) => isFinite(range) ? String(range) : 'unlimited';
  return <Box title="Spotting Range">
    <Scroll>
      <table style={table}>
        <tbody>
        <tr>{spottingColumns.map((col, idx) => {
          const isSelected = col.range === fire.spottingRange;
          return <td style={{...td, ...cellBg(idx, isSelected), ...(isSelected ? resolved : {}), verticalAlign: 'top'}}>
            <div style={{fontWeight: 'bold', fontFamily: 'Arial, sans-serif'}}>
              {isFinite(col.range) ? col.range : ''}
            </div>
            <div style={{fontSize: 10, whiteSpace: 'normal'}}>{col.label}</div>
          </td>;
        })}</tr>
        </tbody>
      </table>
    </Scroll>
    <table style={{...table, marginTop: '1mm'}}>
      <tbody>{state.defender.units.map((def, idx) =>
        <tr>
          <td style={{...td, ...cellBg(idx, false)}}><UnitImg def={def}/></td>
          <td style={{...td, ...cellBg(idx, false)}}>{rangeLabel(unitSpottingRange(def))}</td>
        </tr>
      )}</tbody>
    </table>
    <Result>
      Range {state.distance} {fire.spotted ? '≤' : '>'} {rangeLabel(fire.spottingRange)}:{' '}
      <b>{fire.spotted ? 'Spotted' : 'Unspotted'}</b>
      {fire.noLOS && <> — <b style={{color: '#c00'}}>No LOS</b></>}
    </Result>
  </Box>;
}

function AreaTargetStacking({fire}: SectionProps) {
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
    <p style={note}>Target steps: {fire.targetSteps}</p>
    {raw !== undefined && raw < 0 && fire.areaTargetStacking === 0 &&
      <p style={note}>*Applies only to artillery or unspotted SFAs that include any Low-Trajectory firers.</p>}
    <Result>Shift: <b>{signed(fire.areaTargetStacking)}</b></Result>
  </Box>;
}

const areaFireRangeRows = [
  ['inf', 'Inf'],
  ['low', 'Low'],
  ['high', 'High'],
  ['mrt', 'Mortar'],
] as const;

function AreaFireRange({state, fire}: SectionProps) {
  const columns = Object.entries(areaFireRangeModifiers);
  const usedRows = new Set(state.attacker.units
    .map(unitStats)
    .filter(stats => stats.firerType === 'area')
    .map(rowOf));
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
    <p style={note}>Does not apply to Artillery or Sortie. Apply the one that most favors the defender.</p>
    <Result>Shift: <b>{signed(fire.areaFireRange)}</b></Result>
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
  const spottedValues = fire.spotted || !includesLowTrajectory(state);
  const hasAreaTargets = state.defender.units.some(def => unitStats(def).targetType !== 'point');
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
              ...(isSelected && hasAreaTargets ? resolved : {}),
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
    {!hasAreaTargets && <p style={note}>No Area targets in the hex.</p>}
    <Result>Shift: <b>{signed(fire.targetTerrainPosture)}</b></Result>
  </Box>;
}

function OtherModifiers({state, fire}: SectionProps) {
  return <Box title="Other Modifiers">
    <ModifierList modifiers={otherModifiersCandidates(state.attacker, state.defender, state.distance)}/>
    <p style={note}>
      Night, Illuminated/Twilight and Smoke do not apply to Artillery.
      All Suppressed/Paralyzed not at range 0. P-2+ target in hex: Low-Trajectory Area Fire only (tank cover).
    </p>
    <Result>Shift: <b>{signed(fire.otherModifiers.total)}</b></Result>
  </Box>;
}

function FireTable({fire, dice}: SectionProps & { dice: number }) {
  const input = fireTableInput(fire);
  const rawColumn = fireTable.column({...input, shift: 0});
  const column = fireTable.column(input);
  const result = fireTable.result(input, dice);
  const shifts = [
    ['Area Target Stacking', fire.areaTargetStacking],
    ['Area Fire Range', fire.areaFireRange],
    ['Target Terrain / Posture', fire.targetTerrainPosture],
    ['Other Modifiers', fire.otherModifiers.total],
  ] as const;
  return <Box title="Fire Table" yellowTitle style={full}>
    <table style={{...table, width: 'auto'}}>
      <tbody>
      {shifts.map(([label, value], idx) =>
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
        <tr>
          <th style={{...th, ...sticky, background: yellow}}>A-Fire</th>
          {rawColumns.map((label, idx) => <th style={{
            ...th,
            ...cellBg(0, idx === column.index),
            fontWeight: idx === column.index ? 'bold' : 'normal',
            outline: idx === rawColumn.index ? '1px dashed black' : undefined,
            outlineOffset: '-2px',
          }} data-focus={idx === column.index || undefined}>{label}</th>)}
        </tr>
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
      <b>For Area Fires:</b> Total Area Fire Strength Points.
      All results other than No Effect require a <b>Morale Check</b>.
    </p>
    <Result>
      Strength {input.firepower} → column {rawColumn.label}, shift {signed(input.shift)} →
      column <b>{column.label}</b>; roll {dice > 0 ? dice : '–'}: <b>{dice > 0 ? result : '–'}</b>
    </Result>
  </Box>;
}

function MoraleTable({state, dice, bnMorale, fireResult}: SectionProps & {
  dice: number,
  bnMorale: number,
  fireResult: string
}) {
  const breakdown = moraleBreakdown(state, bnMorale);
  if (breakdown === undefined) {
    return <Box title="Morale Table" yellowTitle style={full}>
      <p style={note}>No unit in the target hex checks Morale (Vehicles and Carriers never do).</p>
    </Box>;
  }
  const mods = R.sumBy(breakdown.modifiers.filter(it => it.applies), it => it.value);
  const moraleResult = morale(breakdown.total, dice);
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
      <Scroll>
        <table style={{...table, marginTop: '1mm'}}>
          <thead>
          <tr>
            <th style={{...th, ...sticky}}>Result</th>
            {R.range(1, 14).map(idx => <th style={{
              ...th,
              ...(idx === moraleResult.column ? cellBg(1, true) : {}),
              fontWeight: idx === moraleResult.column ? 'bold' : 'normal',
            }} data-focus={idx === moraleResult.column || undefined}>{header(idx)}</th>)}
          </tr>
          </thead>
          <tbody>{moraleTable.map(([label, ...cells], rowIdx) =>
            <tr>
              <td style={{...td, ...sticky}}>{label}</td>
              {R.range(1, 14).map(idx => {
                const isResolved = idx === moraleResult.column && label === moraleResult.result;
                return <td style={{
                  ...td,
                  ...cellBg(rowIdx, idx === moraleResult.column),
                  ...(isResolved ? resolved : {}),
                }}>{cells[idx - 1] ?? ''}</td>;
              })}
            </tr>
          )}</tbody>
        </table>
      </Scroll>
      <Result>
        {fireResult === 'No Effect'
          ? <>Fire result is No Effect — no Morale Check needed.</>
          : <>Column <b>{header(moraleResult.column)}</b>; roll {dice > 0 ? dice : '–'}:{' '}
            <b>{moraleResult.result ?? '–'}</b></>}
      </Result>
    </Box>
  </>;
}

export function FireExplanation(props: { dice: number, bnMorale: number, onBack(): void }) {
  const {state} = useContext(Context);
  const fire = fireResolution(state);
  const fireResult = fireTable.result(fireTableInput(fire), props.dice);
  const sectionProps = {state, fire};
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
          Fire Resolution
        </h1>
        <span style={{fontFamily: serif, fontVariant: 'small-caps', fontWeight: 'bold', fontSize: 14}}>
          Tactical Combat Series
        </span>
      </header>
      <FireStrength {...sectionProps}/>
      <InfFirepower {...sectionProps}/>
      <Spotting {...sectionProps}/>
      <AreaTargetStacking {...sectionProps}/>
      <AreaFireRange {...sectionProps}/>
      <TargetTerrainPosture {...sectionProps}/>
      <OtherModifiers {...sectionProps}/>
      <FireTable {...sectionProps} dice={props.dice}/>
      <MoraleTable {...sectionProps} dice={props.dice} bnMorale={props.bnMorale} fireResult={fireResult}/>
    </div>
    <div style={{position: 'fixed', right: '2mm', bottom: '2mm'}}>
      <BackButton onClick={props.onBack}/>
    </div>
  </div>;
}
