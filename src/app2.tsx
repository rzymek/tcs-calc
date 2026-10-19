import {CSSProperties, useState} from "preact/compat";
import "./app.css";
import * as R from "remeda";

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
const markers = import.meta.glob<string>(`./images/markers/*.{png,svg}`);
const terrain = import.meta.glob<string>(`./images/terrain/*.png`);
const britColor = 'lightblue';
const argColor = 'lightcoral';

export function App2() {
  const [selectedTerrain, setSelectedTerrain] = useState<string>();
  const [distance, setDistance] = useState<number>();
  return <div style={{
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: `1fr 1fr`,
    gridTemplateRows: `1fr 12mm 10mm 10mm 1fr 2cm 12mm`,
  }}>
    <div style={{...cell, background: britColor}}>
      {resolveAll(brit).map(img => <img src={img} style={{width: '1cm'}} alt={img}/>)}
    </div>
    <div style={{...cell, background: argColor}}>
      {resolveAll(arg).map(img => <img src={img} style={{width: '1cm'}} alt={img}/>)}
    </div>
    <div style={{...wide, display: 'grid', gridTemplateColumns: `${2 * 12}mm 1fr`, overflow: 'hidden'}}>
      <div style={{background: 'lightblue', overflow: 'auto'}}>
        <img src={import.meta.resolve('./images/markers/suppressed.png')} style={{width: '1cm'}} alt="impop"/>
        <img src={import.meta.resolve('./images/markers/arty.png')} style={{width: '1cm'}} alt="impop"/>
      </div>
      <div style={{background: argColor, overflow: 'auto'}}>
        <img src={import.meta.resolve('./images/markers/night.svg')} style={{width: '1cm'}} alt="impop"/>
        <img src={import.meta.resolve('./images/markers/illum.png')} style={{width: '1cm'}} alt="impop"/>
        <img src={import.meta.resolve('./images/markers/suppressed.png')} style={{width: '1cm'}} alt="impop"/>
        <img src={import.meta.resolve('./images/markers/smoke.png')} style={{width: '1cm'}} alt="impop"/>
        <img src={import.meta.resolve('./images/markers/arty.png')} style={{width: '1cm'}} alt="impop"/>
        <img src={import.meta.resolve('./images/markers/dugin.png')} style={{width: '1cm'}} alt="impop"/>
        <img src={import.meta.resolve('./images/markers/unassigned.svg')} style={{width: '1cm'}} alt="impop"/>
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
        width: '10mm',
        minWidth: '10mm',
        ...(distance === it && {background: 'rgb(0,0,255,0.5)', color: 'white'}),
      }} onClick={() => setDistance(it)}>{it}</button>)}
    </div>
    <div style={cell}>brit selected</div>
    <div style={cell}>arg selected</div>
    <div style={wide}/>
    <div style={cell}/>
    <div style={cell}/>
  </div>
}

function resolveAll(paths: Record<string, unknown>) {
  return Object.keys(paths).map(it => import.meta.resolve(it));
}