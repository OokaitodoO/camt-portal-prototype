import toggleScrollbar from './popup.js';

function openCreatePopup() {
    console.log("Opening...createPopup");
    const popup = document.getElementById('popupCreate');
    const overlay = document.getElementById('overlay');
    resetDropdownSelection(popup);
    resetTextInput(popup);
    toggleScrollbar(popup);
    popup.classList.add('active');
    overlay.classList.add('active');
}

function closeCreatePopup() {
    console.log("Closing...createPopup");
    const popup = document.getElementById('popupCreate')
    const overlay = document.getElementById('overlay');
    toggleScrollbar(popup);
    popup.classList.remove('active');
    overlay.classList.remove('active');
}

function openEditPopup() {
    console.log("Opening...editPopup");
    const popup = document.getElementById('popupEdit');
    const overlay = document.getElementById('overlay');
    toggleScrollbar(popup);
    popup.classList.add('active');
    overlay.classList.add('active');
}

function closeEditPopup() {
    console.log("Closing...editPopup");
    const popup = document.getElementById('popupEdit');
    const overlay = document.getElementById('overlay');
    popup.classList.remove('active');
    overlay.classList.remove('active');
}

function openDeleteConfirmationPopup() {
    const deletePopup = document.getElementById('deleteConfirmationPopup');
    const overlay = document.getElementById('overlay');
    closeEditPopup();
    deletePopup.classList.add('active');
    overlay.classList.add('active');
}

function deleteDepartment() {
    const deletePopup = document.getElementById('deleteConfirmationPopup');
    const overlay = document.getElementById('overlay');
    closeDeleteConfirmation();
    deletePopup.classList.remove('active');
    overlay.classList.remove('active');
}

function closeDeleteConfirmation() {
    const deletePopup = document.getElementById('deleteConfirmationPopup'); 
    const overlay = document.getElementById('overlay');   
    deletePopup.classList.remove('active');
    overlay.classList.remove('active');
}

function createNewDepartment() {
    console.log("Created new department");
    closeCreatePopup();
}

function confirmEditDepartment() {
    console.log("department edited");
    closeEditPopup();
}

function createNewMember() {
    console.log("Created new member");
    closeCreatePopup();
}

function confirmEditMember() {
    console.log("member edited");
    closeEditPopup();
}

function deleteMember() {
    console.log("Deleted member");
    closeDeleteConfirmation();
}

function createNewTask() {
    console.log("Created new task");
    closeCreatePopup();
}

function confirmEditTask() {
    console.log("department edited");
    closeEditPopup();
}

function deleteTask() {
    console.log("Deleted task");
    closeDeleteConfirmation();
}

function resetTextInput(popup) {
    // Clear all input fields in the popup
    const inputs = popup.querySelectorAll('input[type="text"]');
    if(inputs) {
        console.log('reset text input');
        inputs.forEach(input => {
            input.value = '';
        });
    }
}

function resetDropdownSelection(popup) {
    // Reset dropdown selections if any
    const dropdowns = popup.querySelectorAll('.selected-text');
    if(dropdowns){
        console.log('reset dropdown selection');
        dropdowns.forEach(dropdown => {
            dropdown.textContent = 'เลือกหน่วยงาน';
        });
    }
}


window.openCreatePopup = openCreatePopup;  
window.closeCreatePopup = closeCreatePopup;
window.createNewDepartment = createNewDepartment;
window.confirmEditDepartment = confirmEditDepartment;
window.deleteDepartment = deleteDepartment;
window.createNewMember = createNewMember;
window.confirmEditMember = confirmEditMember;
window.deleteMember = deleteMember;
window.createNewTask = createNewTask;  
window.openEditPopup = openEditPopup;
window.closeEditPopup = closeEditPopup;
window.confirmEditDepartment = confirmEditDepartment;  
window.confirmEditTask = confirmEditTask;
window.deleteTask = deleteTask;
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup;
window.closeDeleteConfirmation = closeDeleteConfirmation;


