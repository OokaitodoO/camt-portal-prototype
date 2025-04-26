function selectDepartment(element, dropdownMenu) {
    const selectedText = element.textContent;
    element.closest('.dropdown').querySelector('.selected-text').textContent = selectedText;
    toggleDropdownDepartment(dropdownMenu);
}

function selectMember(element, dropdownMenu) {
    const selectedText = element.textContent;
    element.closest('.dropdown').querySelector('.selected-text').textContent = selectedText;
    toggleDropdownMember(dropdownMenu);
}

function selectRole(element, dropdownMenu) {
    const selectedText = element.textContent;
    element.closest('.dropdown').querySelector('.selected-text').textContent = selectedText;
    toggleDropdownRole(dropdownMenu);
}

function toggleDropdownDepartment(dropdownMenu) {
    const dropdown = document.getElementById(dropdownMenu);
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function toggleDropdownMember(dropdownMenu) {
    const dropdown = document.getElementById(dropdownMenu);
    console.log(dropdown);
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function toggleDropdownRole(dropdownMenu) {
    const dropdown = document.getElementById(dropdownMenu);
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

window.toggleDropdownDepartment = toggleDropdownDepartment;
window.toggleDropdownMember = toggleDropdownMember;
window.selectDepartment = selectDepartment;
window.selectMember = selectMember;
window.selectRole = selectRole;
