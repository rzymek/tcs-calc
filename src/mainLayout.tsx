import {CSSProperties, useContext} from "preact/compat";
import "./app.css";
import * as R from "remeda";
import {Context} from "./context.tsx";
import {useSide} from "./useSide.tsx";
import {terrainFromImgName} from "./terrainFromImgName.tsx";

const size = 12; // mm

const cell: CSSProperties = {
  border: '1px solid black',
  overflow: 'auto',
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'flex-start',
  justifyContent: 'center',
} as const;
const wide: CSSProperties = {...cell, gridColumn: 'span 2', flexWrap: 'nowrap', overflowY: 'hidden'};

const brit = import.meta.glob<string>(`./images/units/Brit/*.png`);
const steps = import.meta.glob<string>(`./images//steps/*.png`);
const arg = import.meta.glob<string>(`./images/units/Arg/*.png`);
const terrain = import.meta.glob<string>(`./images/terrain/*.png`);
const paralyzed: Mod = {mod: 'paralyzed', src: import.meta.resolve('./images/markers/paralyzed.png')};

type UnitImages = typeof brit;

const bgColor = {
  attacker: 'lightblue',
  defender: 'lightcoral',
} as const;

function Units(props: {
  field: 'units' | 'stepLosses',
  side: 'attacker' | 'defender',
  units: UnitImages,
}) {
  const [, update] = useSide(props.side);
  return <div style={{...cell, background: bgColor[props.side]}}>
    {resolveAll(props.units).map(img =>
      <img src={img}
           style={{width: `${size}mm`, cursor: 'pointer'}}
           alt={img}
           onClick={() => update('units')(prev => [...prev, img])}/>
    )}
  </div>;
}

const units: UnitImages[] = [brit, arg];

function TerrainSelector() {
  const {state, update} = useContext(Context);

  return <div style={{
    ...wide,
    display: 'grid',
    gridTemplateColumns: `repeat(${R.keys(terrain).length},1fr)`,
    overflow: 'hidden',
    padding: 0
  }}>
    {resolveAll(terrain).map(img => {
      const terrainValue = terrainFromImgName(img);
      return <div style={{position: 'relative', cursor: 'pointer'}}
                  onClick={() => update({terrain: terrainValue})}>
        <img src={img}
             style={{width: '100%', height: `${size}mm`, border: 0, display: 'block'}}
             alt={terrainValue.name}/>
        {state.terrain?.name === terrainValue.name && <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 100, 255, 0.5)',
          pointerEvents: 'none',
        }}/>}
      </div>;
    })}
  </div>

}

function Modifiers() {
  const [attacker, updateAttacker] = useSide('attacker');
  const [defender, updateDefender] = useSide('defender');

  return <div style={{...wide, display: 'grid', gridTemplateColumns: `${2 * (size + 2)}mm 1fr`, overflow: 'hidden'}}>
    <div style={{background: 'lightblue', overflow: 'auto'}}>
      <ModToggles selected={attacker.mods} setSelected={updateAttacker('mods')} mods={[
        {mod: 'suppressed', src: import.meta.resolve('./images/markers/suppressed.png'), next: paralyzed},
        {mod: 'arty', src: import.meta.resolve('./images/markers/arty.png')},
        {mod: 'dugin', src: import.meta.resolve('./images/markers/dugin.png')},
        {mod: 'smoke', src: import.meta.resolve('./images/markers/smoke.png')},
      ]}/>
    </div>
    <div
      style={{
        background: bgColor.defender,
        overflow: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }}>
      <ModToggles selected={defender.mods} setSelected={updateDefender('mods')} mods={[
        {mod: 'night', src: import.meta.resolve('./images/markers/night.svg')},
        {mod: 'twilight', src: import.meta.resolve('./images/markers/twilight.svg')},
        {mod: 'illum', src: import.meta.resolve('./images/markers/illum.png')},
        {mod: 'suppressed', src: import.meta.resolve('./images/markers/suppressed.png'), next: paralyzed},
        {mod: 'smoke', src: import.meta.resolve('./images/markers/smoke.png')},
        {mod: 'arty', src: import.meta.resolve('./images/markers/arty.png')},
        {mod: 'dugin', src: import.meta.resolve('./images/markers/dugin.png')},
        {mod: 'unassigned', src: import.meta.resolve('./images/markers/unassigned.svg')},
        {mod: 'road-moving', src: import.meta.resolve('./images/markers/road-moving.png')},
        {mod: 'firing', src: import.meta.resolve('./images/markers/firing.png')},
        {mod: 'moving', src: import.meta.resolve('./images/markers/moving.svg')},
      ]}/>
    </div>
  </div>
}

function RangeSelector() {
  const {state, update} = useContext(Context);
  return <div style={{...wide,}}>
    {R.range(0, 30 + 1).map(it => <button style={{
      width: `${size}mm`,
      minWidth: `${size}mm`,
      ...(state.distance === it && {background: 'rgb(0,0,255,0.5)', color: 'white'}),
    }} onClick={() => update({distance: it})}>{it}</button>)}
  </div>
}

function SwitchSidesButton() {
  return <button style={{
    gridArea: "5 / 1 / 6 / 3",
    alignSelf: "end",
    justifySelf: "center",
    marginBottom: "2mm",
    zIndex: 1,
    width: `${size}mm`,
    height: `${size}mm`
  }}>
    🔄
  </button>;
}

export function MainLayout() {
  const {state}  = useContext(Context);
  const [attackingUnits, defendingUnits] = state.attackingSide === 'Britain' ? units : R.pipe(units, R.reverse());

  return <div style={{
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: `1fr 1fr`,
    gridTemplateRows: `
      2fr 
      ${size + 2}mm 
      ${2 * (size + 2)}mm 
      ${size}mm 
      ${size}mm 
      2fr 
      ${size}mm 
      ${2 * size}mm 
      ${size + 2}mm
    `,
  }}>
    <Units side="attacker" field='units' units={attackingUnits}/>
    <Units side="defender" field='units' units={defendingUnits}/>
    <Units side="attacker" field='stepLosses' units={steps}/>
    <Units side="defender" field='stepLosses' units={steps}/>
    <Modifiers/>
    <TerrainSelector/>
    <RangeSelector/>
    <SelectedImages side='attacker'/>
    <SelectedImages side='defender'/>
    <div style={wide}/>
    <div style={cell}/>
    <div style={cell}/>
    <div style={wide}/>
  </div>
}

type Mod = { mod: string, src: string, next?: Mod };

function SelectedImages(props: {
  side: 'attacker' | 'defender',
}) {
  const [side, updateSide] = useSide(props.side);
  return <div style={{...cell, background: bgColor[props.side]}}>
    {(['units', 'stepLosses'] as const).flatMap(key =>
      side[key].map((img, idx) =>
        <img src={img}
             style={{width: `${size}mm`, cursor: 'pointer'}}
             alt={img}
             onClick={() => updateSide(key)(prev => prev.filter((_, i) => i !== idx))}/>))}
  </div>;
}

function ModToggles({mods, selected, setSelected}: {
  mods: Mod[],
  selected: string[],
  setSelected: (update: (prev: string[]) => string[]) => void,
}) {
  // click cycles: unselected -> mod -> mod.next -> ... -> unselected
  const toggle = (first: Mod) => setSelected(prev => {
    for (let it: Mod | undefined = first; it; it = it.next) {
      if (prev.includes(it.mod)) {
        const rest = prev.filter(m => m !== it!.mod);
        return it.next ? [...rest, it.next.mod] : rest;
      }
    }
    return [...prev, first.mod];
  });
  const current = (first: Mod) => {
    for (let it: Mod | undefined = first; it; it = it.next) {
      if (selected.includes(it.mod)) return it;
    }
  };
  return <>
    {mods.map(first => {
      const active = current(first);
      const {mod, src} = active ?? first;
      return <div style={{position: 'relative', display: 'inline-block', cursor: 'pointer'}}
                  onClick={() => toggle(first)}>
        <img src={src} style={{width: `${size}mm`, display: 'block'}} alt={mod}/>
        {active && <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 100, 255, 0.5)',
          pointerEvents: 'none',
        }}/>}
      </div>;
    })}
  </>;
}

function resolveAll(paths: Record<string, unknown>) {
  return Object.keys(paths).map(it => import.meta.resolve(it));
}