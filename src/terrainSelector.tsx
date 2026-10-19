import {useContext} from "preact/compat";
import {Context} from "./context.tsx";
import {wide} from "./mainLayoutCell.tsx";
import * as R from "remeda";
import {resolveAll} from "./resolveAll.tsx";
import {terrainFromImgName} from "./terrainFromImgName.tsx";
import {size} from "./size.tsx";

const terrain = import.meta.glob<string>(`./images/terrain/*.png`);

export function TerrainSelector() {
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