export function setupDropdown(button, menu){
    function toggleMenu() {
        menu.classList.toggle("hidden");
        menu.classList.toggle("visible");
    }

    // Add event listener to the button
    button.addEventListener("click", toggleMenu);
}