import {size} from "./size.tsx";

export function SwitchSidesButton() {
  return <button style={{
    width: `${size}mm`,
    height: `${size}mm`
  }}>
    🔄
  </button>;
}

export function InfoButton() {
  return <button style={{
    width: `${size}mm`,
    height: `${size}mm`
  }}>
    📝
  </button>;
}