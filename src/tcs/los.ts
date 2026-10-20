import {FireState, has} from "./state.ts";

/**
 * 26.1c Visibility at night is two hexes. 26.2b an illuminated area acts as a spot of daylight.
 * 7.1b Overwatch Fires are not allowed at targets beyond the Spotting Range.
 */
export function isNoLOS(state: FireState, spotted: boolean) {
  const {defender, distance} = state;
  const overwatch = has(defender, 'firing', 'moving');
  const nightBlocked = has(defender, 'night') && !has(defender, 'illum') && distance > 2;
  return nightBlocked || (overwatch && !spotted);
}
