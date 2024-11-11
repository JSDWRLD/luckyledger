import './style.css'
import logo from '/fulllogo.png'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <div class="card">
      <img src="${logo}" href="LuckyLedger Logo"/>
      <button id="counter" type="button"></button>
    </div>
  </div>
`

setupCounter(document.querySelector('#counter'))
