function selectDepartment(element) {
    const selectedText = element.textContent;
    element.closest('.dropdown').querySelector('.selected-text').textContent = selectedText;
    toggleDropdownDepartment();
}

function selectMember(element) {
    const selectedText = element.textContent;
    element.closest('.dropdown').querySelector('.selected-text').textContent = selectedText;
    toggleDropdownMember();
}

function toggleDropdown() {
    const dropdown = document.getElementById("dropdownMenu");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function toggleDropdownDepartment() {
    const dropdown = document.getElementById("dropdownMenuDepartment");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function toggleDropdownMember() {
    const dropdown = document.getElementById("dropdownMenuMember");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

window.toggleDropdown = toggleDropdown;
window.toggleDropdownDepartment = toggleDropdownDepartment;
window.toggleDropdownMember = toggleDropdownMember;
window.selectDepartment = selectDepartment;
window.selectMember = selectMember;
