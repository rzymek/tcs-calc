import {ToggleButton} from "./toggleButton.tsx";

export type PickProps = {
    label: string,
    wrap?: boolean,
    values: (string | number)[],
    onClick?(value: string | number): boolean,
    minWidth?: string,
};

export function Pick(props: PickProps & {
    selected: (string | number)[],
    onClick(v: string | number): void
}) {
    return <div style={{
        border: 'solid 1px black',
        overflowX: 'auto',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: props.wrap ? 'wrap' : undefined,
        position: 'relative'
    }} className="Pick">
        <div style={{
            position: 'absolute',
            inset: 0,
            fontSize: '200%',
            opacity: 0.2,
            pointerEvents: 'none',
            fontWeight: 'bold',
            textAlign: 'center'
        }}>{props.label}</div>
        {props.values.map(v => {
                return <ToggleButton key={v} value={v}
                                     selected={props.selected.includes(v)}
                                     onClick={() => props.onClick(v)}
                                     minWidth={props.minWidth}/>;
            }
        )}
    </div>
}