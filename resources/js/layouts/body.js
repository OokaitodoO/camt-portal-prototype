// Add event listener for overlay clicks
document.addEventListener('click', function(event) {
    // Debug: Log clicked element
    // console.log('Clicked element:', event.target);
    // console.log('Element class list:', event.target.classList);
    // console.log('Element ID:', event.target.id);

    // Check if click is on overlay
    if (event.target.id === 'popupCreate' || event.target.id === 'popupEdit' || event.target.id === 'deleteConfirmationPopup') {
        console.log('Overlay clicked - closing all popups');
        closeAllPopups();
        document.body.classList.remove('lock-scroll');
    }
});

// Function to close all popups
function closeAllPopups() {
    // Close create popup
    const createPopup = document.getElementById('popupCreate');
    if (createPopup) {
        createPopup.classList.remove('active');
    }

    // Close edit popup
    const editPopup = document.getElementById('popupEdit');
    if (editPopup) {
        editPopup.classList.remove('active');
    }

    // Close delete confirmation popup
    const deletePopup = document.getElementById('deleteConfirmationPopup');
    if (deletePopup) {
        deletePopup.classList.remove('active');
    }

    // Hide overlay
    document.getElementById('overlay').classList.remove('active');
}
