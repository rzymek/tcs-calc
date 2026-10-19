import {describe, expect, it} from "vitest";
import {terrainFromImgName} from "./terrainFromImgName.tsx";

describe('terrainFromImgName', () => {
  it('gorse line', () => {
    expect(terrainFromImgName('src/images/02_gorse line-partly pro.png')).toEqual({
      name: 'gorse line',
      type: 'partly pro',
    });
  })
});