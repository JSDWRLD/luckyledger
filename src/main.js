import '../src/style.css';
import logo from '/fulllogo.png';
import { setupCounter } from './counter.js';
import { setupDropdown } from './dropdown.js';

// Set up dynamic content
setupCounter(document.querySelector('#counter'));

setupDropdown("hamburgerButton", "dropdownMenu");