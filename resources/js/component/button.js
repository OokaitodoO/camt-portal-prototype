const openPopupButton = document.getElementById('popupButton');
const confirmButton = document.getElementById('confirmButton');
const closePopupButton = document.querySelectorAll('.close-popup');

function openCreatePopup() {
    console.log("Opening...createPopup");
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    popup.classList.add('active');
    overlay.classList.add('active');
}

function closeCreatePopup() {
    console.log("Closing...createPopup");
    const popup = document.getElementById('popup')
    const overlay = document.getElementById('overlay');
    popup.classList.remove('active');
    overlay.classList.remove('active');
}

function createNewDepartment() {
    console.log("Created new department");
    closeCreatePopup();
}

if(closePopupButton){
    closePopupButton.forEach( button => {
        button.addEventListener('click', () => {
            closeCreatePopup();
        })
    
        window.closeCreatePopup = closeCreatePopup;
    })
}
else {
    console.error("Not found close popup button");
}

if(confirmButton){
    confirmButton.addEventListener('click', () => {
        createNewDepartment();
    })
}
else {
    console.error("Not found confirm button element");
}



document.addEventListener('DOMContentLoaded', () => {    
    if(openPopupButton){
        openPopupButton.addEventListener('click', () => {
            openCreatePopup();
        })
    }
    
    window.openCreatePopup = openCreatePopup;  
    window.createNewDepartment = createNewDepartment;  
});
