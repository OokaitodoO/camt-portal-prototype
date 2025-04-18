function openCreatePopup() {
    console.log("Opening...createPopup");
    const popup = document.getElementById('popupCreate');
    const overlay = document.getElementById('overlay');
    popup.classList.add('active');
    overlay.classList.add('active');
}

function closeCreatePopup() {
    console.log("Closing...createPopup");
    const popup = document.getElementById('popupCreate')
    const overlay = document.getElementById('overlay');
    popup.classList.remove('active');
    overlay.classList.remove('active');
}

function createNewDepartment() {
    console.log("Created new department");
    closeCreatePopup();
}

function createNewMember() {
    console.log("Created new member");
    closeCreatePopup();
}

function createNewTask() {
    console.log("Created new task");
    closeCreatePopup();
}
  

document.addEventListener('DOMContentLoaded', () => {    
    if(openPopupButton){
        openPopupButton.addEventListener('click', () => {
            openCreatePopup();
        })
    }
});

window.openCreatePopup = openCreatePopup;  
window.closeCreatePopup = closeCreatePopup;
window.createNewDepartment = createNewDepartment;
window.createNewMember = createNewMember;
window.createNewTask = createNewTask;  
