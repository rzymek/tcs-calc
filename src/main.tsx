import {render} from 'preact'
import './index.css'
import {StateContext} from "./StateContext.tsx";
import {MainLayout} from "./mainLayout.tsx";

render(<App2/>, document.getElementById('app')!)

function App2() {
  return <StateContext>
    <MainLayout/>
  </StateContext>
}
