import '../src/style.css';
import { setupDropdown } from './dropdown.js';


// Set up dynamic content

// Select the elements for the dropdown menu
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("hamButton");
    const dropdownMenu = document.getElementById("dropdownMenu");

    // call the dropdown function
    setupDropdown(toggleButton, dropdownMenu);
});

let lastScrollY = window.scrollY;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > lastScrollY) {
    header.classList.add('hide'); // Hide header on scroll down
  } else {
    header.classList.remove('hide'); // Show header on scroll up
  }
  lastScrollY = window.scrollY;
});


