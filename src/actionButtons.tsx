import {InfoButton} from "./switchSidesButton.tsx";

export function ActionButtons(props: { onInfo(): void }) {
  return <div style={{
    position: 'fixed',
    right: '2mm',
    bottom: '2mm',
    display: 'flex',
    flexDirection: 'column',
    gap: '1mm'
  }}>
    <InfoButton onClick={props.onInfo}/>
  </div>;
}
