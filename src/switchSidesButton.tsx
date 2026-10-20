import {FireType} from "./tcs/state.ts";

const size = 10;

export function SwitchSidesButton(props: { onClick(): void }) {
  return <button style={{
    width: `${size}mm`,
    height: `${size}mm`
  }} onClick={props.onClick}>
    🔄
  </button>;
}

export function FireTypeButton(props: { fireType: FireType, onClick(): void }) {
  return <button style={{
    width: `${size}mm`,
    height: `${size}mm`,
    padding: 0,
  }} onClick={props.onClick}>
    {props.fireType === 'area' ? 'Area' : 'Point'}
  </button>;
}

export function BnMoraleButton(props: { value: number, onClick(): void }) {
  return <button style={{
    width: `${size}mm`,
    height: `${size}mm`,
    padding: 0,
  }} title="Target Battalion Morale" onClick={props.onClick}>
    Bn {props.value}
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

export function ResetButton(props: { onClick(): void }) {
  return <button style={{
    width: `${size}mm`,
    height: `${size}mm`
  }} title="Reset" onClick={props.onClick}>
    🗑️
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