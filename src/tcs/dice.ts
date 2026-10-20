import * as R from "remeda";

/** all 36 rolls of two dice, read as 11..66 */
export const rolls2d6 = R.range(1, 7).flatMap(tens => R.range(1, 7).map(units => tens * 10 + units));
