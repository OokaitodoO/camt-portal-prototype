function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Close the dropdown if clicked outside
window.onclick = function(event) {
    if (!event.target.matches('.btn-status') && !event.target.matches('.btn-status *')) {
        const dropdowns = document.getElementsByClassName('dropdown-menu');
        for (let dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
}

window.toggleUserDropdown = toggleUserDropdown;
