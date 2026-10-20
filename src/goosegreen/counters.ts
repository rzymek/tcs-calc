import {ARGENTINE, BRITAIN} from "./rules.ts";

const brit = import.meta.glob<string>(`../images/units/Brit/*.png`, {eager: true, query: '?url', import: 'default'});
const arg = import.meta.glob<string>(`../images/units/Arg/*.png`, {eager: true, query: '?url', import: 'default'});

export type CounterImages = typeof brit;

export const countersByNation: Record<string, CounterImages> = {
  [BRITAIN]: brit,
  [ARGENTINE]: arg,
};
