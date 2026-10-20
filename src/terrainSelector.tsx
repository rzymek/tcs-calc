import {useContext} from "preact/compat";
import {Context} from "./context.tsx";
import {wide} from "./mainLayoutCell.tsx";
import * as R from "remeda";
import {terrainFromImgName} from "./terrainFromImgName.tsx";
import {size} from "./size.tsx";

const terrain = import.meta.glob<string>(`./images/terrain/*.png`, {eager: true, query: '?url', import: 'default'});

export function TerrainSelector() {
  const {state, update} = useContext(Context);

  return <div style={{
    ...wide,
    display: 'grid',
    gridTemplateColumns: `repeat(${R.keys(terrain).length},1fr)`,
    overflow: 'hidden',
    padding: 0
  }}>
    {Object.entries(terrain).map(([path, url]) => {
      const terrainValue = terrainFromImgName(path);
      return <div style={{position: 'relative', cursor: 'pointer'}}
                  onClick={() => update({terrain: terrainValue})}>
        <img src={url}
             style={{width: '100%', height: `${size}mm`, border: 0, display: 'block'}}
             alt={terrainValue.name}/>
        {state.terrain.name === terrainValue.name && <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 100, 255, 0.5)',
          pointerEvents: 'none',
        }}/>}
      </div>;
    })}
  </div>

}