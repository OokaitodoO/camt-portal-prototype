// Export the popup functions
export function openCreatePopup() {
    document.getElementById('createPopup').style.display = 'flex';
}

export function closeCreatePopup() {
    document.getElementById('createPopup').style.display = 'none';
    document.querySelector('#createPopup form').reset();
    document.getElementById('createPreviewImage').src = '/images/default-avatar.png';
}

export function closeEditPopup() {
    document.getElementById('popupEdit').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

export function closeDeleteConfirmation() {
    document.getElementById('deleteConfirmationPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
} 