import {CSSProperties} from "preact/compat";

export const cell: CSSProperties = {
  border: '1px solid black',
  overflow: 'auto',
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'flex-start',
  justifyContent: 'center',
} as const;
export const wide: CSSProperties = {...cell, gridColumn: 'span 2', flexWrap: 'nowrap', overflowY: 'hidden'};