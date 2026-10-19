import {describe, it, expect} from 'vitest';
import {targetTerrainPosture} from "./targetTerrainPosture.tsx";

describe('targetTerrainPosture', () => {
  it('should', () => {
    expect(targetTerrainPosture({
      mods: ['dugin'],
      units: [],
      stepLosses: [],
    }, {
      type: 'partly pro',
      name: 'gorse line'
    }, {
      spotted: false
    })).toEqual(true);
  });
});
