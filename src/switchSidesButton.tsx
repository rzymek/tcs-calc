import {size} from "./size.tsx";

export function SwitchSidesButton() {
  return <button style={{
    width: `${size}mm`,
    height: `${size}mm`
  }}>
    🔄
  </button>;
}

export function InfoButton(props: { onClick(): void }) {
  return <button style={{
    width: `${size}mm`,
    height: `${size}mm`
  }} onClick={props.onClick}>
    📝
  </button>;
}

export function BackButton(props: { onClick(): void }) {
  return <button style={{
    width: `${size}mm`,
    height: `${size}mm`
  }} onClick={props.onClick}>
    🎲
  </button>;
}