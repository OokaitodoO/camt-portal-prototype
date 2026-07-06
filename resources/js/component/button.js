import toggleScrollbar from './popup.js';

function openCreatePopup() {
    console.log("Opening...createPopup");
    const popup = document.getElementById('popupCreate');
    const overlay = document.getElementById('overlay');
    if (popup) {
        resetForm(popup);
        toggleScrollbar(popup);
        popup.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('lock-scroll');
    } else {
        console.error('Create popup not found');
    }
}

function closeCreatePopup() {
    console.log("Closing...createPopup");
    const popup = document.getElementById('popupCreate')
    const overlay = document.getElementById('overlay');
    if (popup) {
        toggleScrollbar(popup);
        popup.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('lock-scroll');
    }
}

function resetForm(popup) {
    // Reset text inputs
    const textInputs = popup.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    if (textInputs) {
        textInputs.forEach(input => {
            input.value = '';
        });
    }

    // Reset select elements
    const selects = popup.querySelectorAll('select');
    if (selects) {
        selects.forEach(select => {
            select.selectedIndex = 0;
        });
    }

    // Reset file input and preview image
    const fileInput = popup.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.value = '';
    }
    const previewImage = popup.querySelector('#createPreviewImage');
    if (previewImage) {
        previewImage.src = 'https://placehold.co/128';
    }
}

function openEditPopup() {
    console.log("Opening...editPopup");
    const popup = document.getElementById('popupEdit');
    const overlay = document.getElementById('overlay');
    if (popup) {
        toggleScrollbar(popup);
        popup.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('lock-scroll');
    }
}

function closeEditPopup() {
    console.log("Closing...editPopup");
    const popup = document.getElementById('popupEdit');
    const overlay = document.getElementById('overlay');
    if (popup) {
        popup.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('lock-scroll');
    }
}

function openDeleteConfirmationPopup() {
    const deletePopup = document.getElementById('deleteConfirmationPopup');
    const overlay = document.getElementById('overlay');
    if (deletePopup) {
        closeEditPopup();
        deletePopup.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('lock-scroll');
    }
}

function closeDeleteConfirmation() {
    const deletePopup = document.getElementById('deleteConfirmationPopup'); 
    const overlay = document.getElementById('overlay');   
    if (deletePopup) {
        deletePopup.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('lock-scroll');
    }
}

// function createNewDepartment() {
//     console.log("Created new department");
//     closeCreatePopup();
// }

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

// Make functions available globally
window.openCreatePopup = openCreatePopup;
window.closeCreatePopup = closeCreatePopup;
// window.createNewDepartment = createNewDepartment;
// window.confirmEditDepartment = confirmEditDepartment;
// window.deleteDepartment = deleteDepartment;
// window.createNewMember = createNewMember;
// window.confirmEditMember = confirmEditMember;
// window.deleteMember = deleteMember;
// window.createNewTask = createNewTask;  
window.openEditPopup = openEditPopup;
window.closeEditPopup = closeEditPopup;
// window.confirmEditDepartment = confirmEditDepartment;  
// window.confirmEditTask = confirmEditTask;
// window.deleteTask = deleteTask;
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup;
window.closeDeleteConfirmation = closeDeleteConfirmation;

// Export functions
export {
    openCreatePopup,
    closeCreatePopup,
    openEditPopup,
    closeEditPopup,
    openDeleteConfirmationPopup,
    closeDeleteConfirmation
}

