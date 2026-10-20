import {D6Input} from "./d6Input.tsx";

export function Input2D6(props: { value: number, onChange(v: number): void }) {
  const d6d6 = props.value;
  return <div style={{display: 'flex', gap: '1mm'}}>
    <D6Input color="lightblue" value={Math.floor(d6d6 / 10)} onChange={(v) => props.onChange(v * 10 + d6d6 % 10)}/>
    <D6Input color="lightpink" value={d6d6 % 10} onChange={(v) => props.onChange(d6d6 - d6d6 % 10 + v)}/>
  </div>
}