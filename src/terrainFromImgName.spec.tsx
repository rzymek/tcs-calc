import {describe, expect, it} from "vitest";
import {terrainFromImgName} from "./terrainFromImgName.tsx";

describe('terrainFromImgName', () => {
  it('gorse line', () => {
    expect(terrainFromImgName('src/images/02_gorse line-partly pro.png')).toEqual({
      name: 'gorse line',
      type: 'partly pro',
    });
  })
  it('url-encoded', () => {
    expect(terrainFromImgName('/src/images/terrain/02_gorse%20line-partly%20pro.png')).toEqual({
      name: 'gorse line',
      type: 'partly pro',
    });
  })
});