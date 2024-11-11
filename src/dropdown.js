//hamburger button and dropdown menu elements
const toggleButton = document.getElementById("hamburgerButton");
const dropdownMenu = document.getElementById("dropdownMenu");

//Toggles the dropdown menu visibility
function toggleMenu() {
    if (dropdownMenu == "hidden") {
        dropdownMenu.classList.toggle("visible"); // Shows the menu
    }
    else
        dropdownMenu.classList.toggle("hidden"); // hides the menu
}
// event listener for button
toggleButton.addEventListener("click", toggleMenu);