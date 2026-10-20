import {PropsWithChildren, useCallback, useState} from "preact/compat";
import {initialState, State} from "./state.ts";
import {Context} from "./context.tsx";

export function StateContext({children, transition}: PropsWithChildren<{ transition?(prev: State, next: State): State }>) {
  const [state, setState] = useState<State>(initialState);

  return <Context.Provider value={{
    state,
    update: useCallback((v) => {
      setState(prev => {
        const next = {
        ...prev,
        ...v
        };
        // console.log(next)
        return transition ? transition(prev, next) : next;
      })
    }, [transition])
  }}>{children}</Context.Provider>
}