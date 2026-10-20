import {Terrain} from "./tcs/state.ts";

export function terrainFromImgName(img: string): Terrain {
  const match = decodeURIComponent(img).match(/\d+_(.+)-(.+)\.png$/);
  if (!match) {
    throw new Error(`Invalid terrain image: ${img}`);
  }
  const [, name, type] = match;
  return {
    type,
    name,
  };
}