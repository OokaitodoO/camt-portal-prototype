console.log('Department JS loaded');

let currentCard = null;
let departmentToDelete = null;

function Testing() {
    console.log('Hello world!');
}

function openEditPopup(element) {
    console.log('Opening edit popup...');
    const popup = document.getElementById('editPopup');
    
    const departmentName = element.getAttribute('data-department');
    const input = document.getElementById('departmentName');
    
    currentCard = element.closest('.department-card');
    
    if (popup && input && currentCard) {
        input.value = departmentName;
        popup.style.display = 'flex';
    } else {
        console.error('Some elements not found');
    }
}

function closeEditPopup() {
    console.log('Closing edit popup...');
    const popup = document.getElementById('editPopup');
    if (popup) {
        popup.style.display = 'none';
        // Reset current card
        currentCard = null;
    }
}

function handleEditKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const newName = event.target.value;
        if (newName.trim() !== '') {
            saveDepartmentName(event);
        }
    } else if (event.key === 'Escape') {
        closeEditPopup();
    }
}

function saveDepartmentName(event) {
    event.preventDefault();
    
    const newName = document.getElementById('departmentName').value;
    const iconFile = document.getElementById('editDepartmentIcon').files[0];
    const oldName = currentCard.querySelector('.department-name').textContent;
    
    if (!currentCard || newName.trim() === '') {
        return;
    }
    
    const formData = new FormData();
    formData.append('name', newName);
    formData.append('old_name', oldName);
    if (iconFile) {
        formData.append('icon', iconFile);
    }
    
    axios.post('/departments/update', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then(response => {
        console.log('Update response:', response);
        const departmentNameElement = currentCard.querySelector('.department-name');
        const iconElement = currentCard.querySelector('.card-content img');
        
        departmentNameElement.textContent = newName;
        if (response.data.icon_path) {
            iconElement.src = response.data.icon_path;
        }
        
        currentCard.classList.add('updated');
        closeEditPopup();
    })
    .catch(error => {
        console.error('Error updating department:', error);
        console.error('Error details:', error.response?.data);
        alert('Failed to update department. Please try again.');
    });
}

// Add these new functions
function openCreatePopup() {
    console.log('Opening create popup...');
    const popup = document.getElementById('createPopup');
    if (popup) {
        popup.style.display = 'flex';
    } else {
        console.error('Create popup element not found');
    }
}

function closeCreatePopup() {
    console.log('Closing create popup...');
    const popup = document.getElementById('createPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function createDepartmentCard(name) {
    const card = document.createElement('div');
    card.className = 'department-card new';
    
    card.innerHTML = `
        <div class="card-edit">
            <span><a href="#" class="icon-action" onclick="openEditPopup(this)" data-department="${name}">
                <i class="fas fa-edit"></i> แก้ไข
            </a></span>
        </div>
        <div class="card-content">
            <span><i class="fas fa-building fa-3x"></i></span>
            <p class="department-name">${name}</p>
        </div>
    `;
    
    // Get the container
    const container = document.querySelector('.content-container');
    
    // Remove all cards and store them in an array
    const cards = Array.from(container.querySelectorAll('.department-card:not(.create-card)'));
    const createCard = container.querySelector('.create-card');
    
    // Clear the container
    container.innerHTML = '';
    
    // Add new card to the array
    cards.push(card);
    
    // Sort cards by department name
    cards.sort((a, b) => {
        const nameA = a.querySelector('.department-name').textContent.toLowerCase();
        const nameB = b.querySelector('.department-name').textContent.toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    // Add all cards back to container
    cards.forEach(card => container.appendChild(card));
    
    // Add create card at the end
    container.appendChild(createCard);
    
    return card;
}

function previewImage(input, previewId) {
    console.log('Preview image function called:', input, previewId);
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file) {
        // Check file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            alert('ไฟล์ขนาดใหญ่เกินไป กรุณาเลือกไฟล์ขนาดไม่เกิน 2MB');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        console.log('No file selected');
    }
}

function createDepartment(event) {
    event.preventDefault();
    
    const newName = document.getElementById('newDepartmentName').value;
    const iconFile = document.getElementById('createDepartmentIcon').files[0];
    
    if (newName.trim() === '') {
        alert('กรุณากรอกชื่อหน่วยงาน');
        return;
    }
    
    const formData = new FormData();
    formData.append('name', newName);
    if (iconFile) {
        formData.append('icon', iconFile);
    }
    
    axios.post('/departments/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then(response => {
        location.reload(); // Reload the page to show the new department
    })
    .catch(error => {
        console.error('Error creating department:', error);
        console.error('Error details:', error.response?.data);
        alert('Failed to create department. Please try again.');
    });
}

// Update the delete confirmation function
function openDeleteConfirmation() {
    console.log('Opening delete confirmation...');
    const popup = document.getElementById('deletePopup');
    const departmentName = document.getElementById('departmentName').value;
    const nameSpan = document.getElementById('deleteDepartmentName');
    
    // Store the current department name for deletion
    departmentToDelete = departmentName;
    
    if (popup && nameSpan && departmentName) {
        console.log('Current card for deletion:', currentCard);
        console.log('Department name for deletion:', departmentName);
        nameSpan.textContent = departmentName;
        popup.style.display = 'flex';
        // Don't close the edit popup until deletion is confirmed
    } else {
        console.error('Delete popup elements not found or department name is empty');
    }
}

function closeDeletePopup() {
    console.log('Closing delete popup...');
    const popup = document.getElementById('deletePopup');
    if (popup) {
        popup.style.display = 'none';
        departmentToDelete = null;
    }
}

function deleteDepartment() {
    if (!currentCard) {
        console.error('No department selected for deletion');
        return;
    }
    
    const departmentName = currentCard.querySelector('.department-name').textContent;
    
    axios.delete(`/departments/${encodeURIComponent(departmentName)}`)
        .then(response => {
            currentCard.classList.add('deleting');
            setTimeout(() => {
                currentCard.remove();
                closeDeletePopup();
                currentCard = null;
            }, 300);
        })
        .catch(error => {
            console.error('Error deleting department:', error);
            console.error('Error details:', error.response?.data);
            alert('Failed to delete department. Please try again.');
        });
}

// Add to your existing event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up listeners...');
    
    // Add click listener to create button as backup
    const createBtn = document.querySelector('.create-btn');
    if (createBtn) {
        console.log('Create button found');
        createBtn.addEventListener('click', openCreatePopup);
    } else {
        console.log('Create button not found');
    }
    
    // Add click listener to popup overlay for closing
    const popupOverlays = document.querySelectorAll('.popup-overlay');
    popupOverlays.forEach(overlay => {
        overlay.addEventListener('click', function(event) {
            if (event.target === this) {
                closeEditPopup();
                closeDeletePopup();
            }
        });
    });
    
    // Explicitly expose functions to window object
    window.openEditPopup = openEditPopup;
    window.closeEditPopup = closeEditPopup;
    window.handleEditKeyPress = handleEditKeyPress;
    window.saveDepartmentName = saveDepartmentName;
    window.openCreatePopup = openCreatePopup;
    window.closeCreatePopup = closeCreatePopup;
    window.createDepartment = createDepartment;
    window.openDeleteConfirmation = openDeleteConfirmation;
    window.closeDeletePopup = closeDeletePopup;
    window.deleteDepartment = deleteDepartment;
    window.previewImage = previewImage;
}); 