import {useSide} from "./useSide.tsx";
import {wide} from "./mainLayoutCell.tsx";
import {size} from "./size.tsx";
import {bgColor} from "./bgColor.tsx";

const paralyzed: Mod = {mod: 'paralyzed', src: import.meta.resolve('./images/markers/paralyzed.png')};

export function Modifiers() {
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