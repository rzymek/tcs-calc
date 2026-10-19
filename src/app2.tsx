import {CSSProperties, useState} from "preact/compat";
import "./app.css";
import * as R from "remeda";

const size = 12; // mm

const cell: CSSProperties = {
  border: '1px solid black',
  overflow: 'auto',
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'flex-start',
} as const;
const wide: CSSProperties = {...cell, gridColumn: 'span 2', flexWrap: 'nowrap', overflowY: 'hidden'};

const brit = import.meta.glob<string>(`./images/units/Brit/*.png`);
const arg = import.meta.glob<string>(`./images/units/Arg/*.png`);
const terrain = import.meta.glob<string>(`./images/terrain/*.png`);
const britColor = 'lightblue';
const argColor = 'lightcoral';

const paralyzed: Mod = {mod: 'paralyzed', src: import.meta.resolve('./images/markers/paralyzed.png')};

export function App2() {
  const [selectedTerrain, setSelectedTerrain] = useState<string>();
  const [distance, setDistance] = useState<number>();
  const [britSelected, setBritSelected] = useState<string[]>([]);
  const [argSelected, setArgSelected] = useState<string[]>([]);
  const [attackerMods, setAttackerMods] = useState<string[]>([]);
  const [defenderMods, setDefenderMods] = useState<string[]>([]);
  return <div style={{
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: `1fr 1fr`,
    gridTemplateRows: `1fr ${2 * (size + 2)}mm ${size}mm ${size}mm 1fr ${2 * size}mm ${size + 2}mm`,
  }}>
    <div style={{...cell, background: britColor}}>
      {resolveAll(brit).map(img => <img src={img} style={{width: `${size}mm`, cursor: 'pointer'}} alt={img}
                                        onClick={() => setBritSelected(prev => [...prev, img])}/>)}
    </div>
    <div style={{...cell, background: argColor}}>
      {resolveAll(arg).map(img => <img src={img} style={{width: `${size}mm`, cursor: 'pointer'}} alt={img}
                                       onClick={() => setArgSelected(prev => [...prev, img])}/>)}
    </div>

    <div style={{...wide, display: 'grid', gridTemplateColumns: `${(size + 2)}mm 1fr`, overflow: 'hidden'}}>
      <div style={{background: 'lightblue', overflow: 'auto'}}>
        <ModToggles selected={attackerMods} setSelected={setAttackerMods} mods={[
          {mod: 'suppressed', src: import.meta.resolve('./images/markers/suppressed.png'), next: paralyzed},
          {mod: 'arty', src: import.meta.resolve('./images/markers/arty.png')},
        ]}/>
      </div>
      <div style={{background: argColor, overflow: 'auto'}}>
        <ModToggles selected={defenderMods} setSelected={setDefenderMods} mods={[
          {mod: 'night', src: import.meta.resolve('./images/markers/night.svg')},
          {mod: 'illum', src: import.meta.resolve('./images/markers/illum.png')},
          {mod: 'suppressed', src: import.meta.resolve('./images/markers/suppressed.png'), next: paralyzed},
          {mod: 'smoke', src: import.meta.resolve('./images/markers/smoke.png')},
          {mod: 'arty', src: import.meta.resolve('./images/markers/arty.png')},
          {mod: 'dugin', src: import.meta.resolve('./images/markers/dugin.png')},
          {mod: 'unassigned', src: import.meta.resolve('./images/markers/unassigned.svg')},
        ]}/>
      </div>
    </div>
    <div style={{
      ...wide,
      display: 'grid',
      gridTemplateColumns: `repeat(${R.keys(terrain).length},1fr)`,
      overflow: 'hidden',
      padding: 0
    }}>
      {resolveAll(terrain).map(img => <div style={{position: 'relative', cursor: 'pointer'}}
                                           onClick={() => setSelectedTerrain(img)}>
        <img src={img} style={{width: '100%', border: 0, display: 'block'}} alt={img}/>
        {selectedTerrain === img && <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 100, 255, 0.5)',
          pointerEvents: 'none',
        }}/>}
      </div>)}
    </div>
    <div style={{...wide,}}>
      {R.range(0, 30 + 1).map(it => <button style={{
        width: `${size}mm`,
        minWidth: `${size}mm`,
        ...(distance === it && {background: 'rgb(0,0,255,0.5)', color: 'white'}),
      }} onClick={() => setDistance(it)}>{it}</button>)}
    </div>
    <button style={{
      gridArea: '5 / 1 / 6 / 3',
      alignSelf: 'end',
      justifySelf: 'center',
      marginBottom: '2mm',
      zIndex: 1,
      width: `${size}mm`,
      height: `${size}mm`
    }}>
      🔄
    </button>
    <div style={{...cell, background: britColor, gridArea: '5 / 1'}}>
      {britSelected.map((img, idx) => <img src={img} style={{width: `${size}mm`, cursor: 'pointer'}} alt={img}
                                           onClick={() => setBritSelected(prev => prev.filter((_, i) => i !== idx))}/>)}
    </div>
    <div style={{...cell, background: argColor, gridArea: '5 / 2'}}>
      {argSelected.map((img, idx) => <img src={img} style={{width: `${size}mm`, cursor: 'pointer'}} alt={img}
                                          onClick={() => setArgSelected(prev => prev.filter((_, i) => i !== idx))}/>)}
    </div>
    <div style={wide}/>
    <div style={cell}/>
    <div style={cell}/>
  </div>
}

type Mod = { mod: string, src: string, next?: Mod };

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