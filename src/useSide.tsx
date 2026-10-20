import {useContext} from "preact/compat";
import {Context} from "./context.tsx";
import {SideState} from "./tcs/state.ts";
import {Role} from "./state.ts";

export function useSide(side: Role) {
  const {state, update} = useContext(Context);
  const updateSide = <K extends keyof SideState>(key: K) =>
    (fn: (prev: SideState[K]) => SideState[K]) =>
      update({[side]: {...state[side], [key]: fn(state[side][key])}});
  return [state[side], updateSide] as const;
}