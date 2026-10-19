import {size} from "./size.tsx";

export function SwitchSidesButton() {
  return <button style={{
    position: 'absolute',
    right: '2mm',
    bottom: '2mm',
    width: `${size}mm`,
    height: `${size}mm`
  }}>
    🔄
  </button>;
}