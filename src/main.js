import '../src/style.css';
import logo from '/fulllogo.png';
import { setupCounter } from './counter.js';
import { setupDropdown } from './dropdown.js';


// Set up dynamic content

// Select the elements for the dropdown menu
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("hamButton");
    const dropdownMenu = document.getElementById("dropdownMenu");

    // call the dropdown function
    setupDropdown(toggleButton, dropdownMenu);
});


setupCounter(document.querySelector('#counter'));


