import {useSide} from "./useSide.tsx";
import {wide} from "./mainLayoutCell.tsx";
import {size} from "./size.tsx";
import {bgColor} from "./bgColor.tsx";

const paralyzed = {mod: 'paralyzed', src: new URL('./images/markers/paralyzed.png', import.meta.url).href} as const;
const defenderModifiers = [
  {mod: 'night', src: new URL('./images/markers/night.svg', import.meta.url).href},
  {mod: 'twilight', src: new URL('./images/markers/twilight.svg', import.meta.url).href},
  {mod: 'illum', src: new URL('./images/markers/illum.png', import.meta.url).href},
  {mod: 'suppressed', src: new URL('./images/markers/suppressed.png', import.meta.url).href, next: paralyzed},
  {mod: 'smoke', src: new URL('./images/markers/smoke.png', import.meta.url).href},
  {mod: 'arty', src: new URL('./images/markers/arty.png', import.meta.url).href},
  {mod: 'dugin', src: new URL('./images/markers/dugin.png', import.meta.url).href},
  {mod: 'unassigned', src: new URL('./images/markers/unassigned.svg', import.meta.url).href},
  {mod: 'road-moving', src: new URL('./images/markers/road-moving.png', import.meta.url).href},
  {mod: 'firing', src: new URL('./images/markers/firing.png', import.meta.url).href},
  {mod: 'moving', src: new URL('./images/markers/moving.svg', import.meta.url).href},
  {mod: 'crossfire', src: new URL('./images/markers/crossfire.png', import.meta.url).href},
] as const;

const attackerModifiers = [
  {mod: 'suppressed', src: new URL('./images/markers/suppressed.png', import.meta.url).href, next: paralyzed},
  {mod: 'arty', src: new URL('./images/markers/arty.png', import.meta.url).href},
  {mod: 'dugin', src: new URL('./images/markers/dugin.png', import.meta.url).href},
  {mod: 'smoke', src: new URL('./images/markers/smoke.png', import.meta.url).href},
] as const;

export type Modifier = (typeof defenderModifiers | typeof attackerModifiers)[number]['mod'] | typeof paralyzed['mod'];
export function Modifiers() {
  const [attacker, updateAttacker] = useSide('attacker');

  const [defender, updateDefender] = useSide('defender');
  return <div style={{...wide, display: 'grid', gridTemplateColumns: `${2 * (size + 2)}mm 1fr`, overflow: 'hidden'}}>
    <div style={{background: 'lightblue', overflow: 'auto'}}>
      <ModToggles selected={attacker.mods} setSelected={updateAttacker('mods')} mods={attackerModifiers}/>
    </div>
    <div
      style={{
        background: bgColor.defender,
        overflow: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }}>
      <ModToggles selected={defender.mods} setSelected={updateDefender('mods')} mods={defenderModifiers}/>
    </div>
  </div>
}

type Mod = { mod: Modifier, src: string, next?: Mod };

function ModToggles({mods, selected, setSelected}: {
  mods: readonly Mod[],
  selected: readonly Modifier[],
  setSelected: (update: (prev: Modifier[]) => Modifier[]) => void,
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