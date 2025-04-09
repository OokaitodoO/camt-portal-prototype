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

closePopupButton.forEach( button => {
    button.addEventListener('click', () => {
        closeCreatePopup();
    })

    window.closeCreatePopup = closeCreatePopup;
})

confirmButton.addEventListener('click', () => {
    createNewDepartment();
})

document.addEventListener('DOMContentLoaded', () => {    
    if(openPopupButton){
        openPopupButton.addEventListener('click', () => {
            openCreatePopup();
        })
    }
    
    window.openCreatePopup = openCreatePopup;  
    window.createNewDepartment = createNewDepartment;  
});
