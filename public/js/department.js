import {
    openCreatePopup,
    closeCreatePopup,
    // openEditPopup,
    closeEditPopup,
    // openDeleteConfirmationPopup,
    closeDeleteConfirmation
} from './component/button.js';
import axios from 'axios';

// Import axios from the window object since we're loading it via CDN

console.log('Department JS loaded');

let currentCard = null;
let departmentToDelete = null;
let currentDepartment = null;

// function openEditPopup(element) {
//     console.log('Opening edit popup...');
//     const popup = document.getElementById('editPopup');
    
//     const departmentName = element.getAttribute('data-department');
//     const input = document.getElementById('departmentName');
    
//     currentCard = element.closest('.department-card');
    
//     if (popup && input && currentCard) {
//         input.value = departmentName;
//         popup.style.display = 'flex';
//     } else {
//         console.error('Some elements not found');
//     }
// }

// function handleEditKeyPress(event) {
//     if (event.key === 'Enter') {
//         event.preventDefault();
//         const newName = event.target.value;
//         if (newName.trim() !== '') {
//             saveDepartmentName(event);
//         }
//     } else if (event.key === 'Escape') {
//         closeEditPopup();
//     }
// }

// function saveDepartmentName(event) {
//     event.preventDefault();
    
//     const newName = document.getElementById('departmentName').value;
//     const iconFile = document.getElementById('editDepartmentIcon').files[0];
//     const oldName = currentCard.querySelector('.department-name').textContent;
    
//     if (!currentCard || newName.trim() === '') {
//         return;
//     }
    
//     const formData = new FormData();
//     formData.append('name', newName);
//     formData.append('old_name', oldName);
//     if (iconFile) {
//         formData.append('icon', iconFile);
//     }
    
//     axios.post('/departments/update', formData, {
//         headers: {
//             'Content-Type': 'multipart/form-data'
//         }
//     })
//     .then(response => {
//         console.log('Update response:', response);
//         const departmentNameElement = currentCard.querySelector('.department-name');
//         const iconElement = currentCard.querySelector('.card-content img');
        
//         departmentNameElement.textContent = newName;
//         if (response.data.icon_path) {
//             iconElement.src = response.data.icon_path;
//         }
        
//         currentCard.classList.add('updated');
//         closeEditPopup();
//     })
//     .catch(error => {
//         console.error('Error updating department:', error);
//         console.error('Error details:', error.response?.data);
//         alert('Failed to update department. Please try again.');
//     });
// }

// function createDepartmentCard(name) {
//     const card = document.createElement('div');
//     card.className = 'department-card new';
    
//     card.innerHTML = `
//         <div class="card-edit">
//             <span><a href="#" class="icon-action" onclick="openEditPopup(this)" data-department="${name}">
//                 <i class="fas fa-edit"></i> แก้ไข
//             </a></span>
//         </div>
//         <div class="card-content">
//             <span><i class="fas fa-building fa-3x"></i></span>
//             <p class="department-name">${name}</p>
//         </div>
//     `;
    
//     // Get the container
//     const container = document.querySelector('.content-container');
    
//     // Remove all cards and store them in an array
//     const cards = Array.from(container.querySelectorAll('.department-card:not(.create-card)'));
//     const createCard = container.querySelector('.create-card');
    
//     // Clear the container
//     container.innerHTML = '';
    
//     // Add new card to the array
//     cards.push(card);
    
//     // Sort cards by department name
//     cards.sort((a, b) => {
//         const nameA = a.querySelector('.department-name').textContent.toLowerCase();
//         const nameB = b.querySelector('.department-name').textContent.toLowerCase();
//         return nameA.localeCompare(nameB);
//     });
    
//     // Add all cards back to container
//     cards.forEach(card => container.appendChild(card));
    
//     // Add create card at the end
//     container.appendChild(createCard);
    
//     return card;
// }

// function previewImage(input, previewId) {
//     console.log('Preview image function called:', input, previewId);
//     const preview = document.getElementById(previewId);
//     const file = input.files[0];
    
//     if (file) {
//         // Check file size (2MB limit)
//         if (file.size > 2 * 1024 * 1024) {
//             alert('ไฟล์ขนาดใหญ่เกินไป กรุณาเลือกไฟล์ขนาดไม่เกิน 2MB');
//             input.value = '';
//             return;
//         }

//         const reader = new FileReader();
//         reader.onload = function(e) {
//             preview.src = e.target.result;
//         };
//         reader.readAsDataURL(file);
//     } else {
//         console.log('No file selected');
//     }
// }

// function createDepartment(event) {
//     event.preventDefault();
    
//     const newName = document.getElementById('newDepartmentName').value;
//     const iconFile = document.getElementById('createDepartmentIcon').files[0];
    
//     if (newName.trim() === '') {
//         alert('กรุณากรอกชื่อหน่วยงาน');
//         return;
//     }
    
//     const formData = new FormData();
//     formData.append('name', newName);
//     if (iconFile) {
//         formData.append('icon', iconFile);
//     }
    
//     axios.post('/departments/create', formData, {
//         headers: {
//             'Content-Type': 'multipart/form-data'
//         }
//     })
//     .then(response => {
//         location.reload(); // Reload the page to show the new department
//     })
//     .catch(error => {
//         console.error('Error creating department:', error);
//         console.error('Error details:', error.response?.data);
//         alert('Failed to create department. Please try again.');
//     });
// }

// Update the delete confirmation function
// function openDeleteConfirmation() {
//     console.log('Opening delete confirmation...');
//     const popup = document.getElementById('deletePopup');
//     const departmentName = document.getElementById('departmentName').value;
//     const nameSpan = document.getElementById('deleteDepartmentName');
    
//     // Store the current department name for deletion
//     departmentToDelete = departmentName;
    
//     if (popup && nameSpan && departmentName) {
//         console.log('Current card for deletion:', currentCard);
//         console.log('Department name for deletion:', departmentName);
//         nameSpan.textContent = departmentName;
//         popup.style.display = 'flex';
//         // Don't close the edit popup until deletion is confirmed
//     } else {
//         console.error('Delete popup elements not found or department name is empty');
//     }
// }

// function deleteDepartment() {
//     if (!currentCard) {
//         console.error('No department selected for deletion');
//         return;
//     }
    
//     const departmentName = currentCard.querySelector('.department-name').textContent;
    
//     axios.delete(`/departments/${encodeURIComponent(departmentName)}`)
//         .then(response => {
//             currentCard.classList.add('deleting');
//             setTimeout(() => {
//                 currentCard.remove();
//                 closeDeletePopup();
//                 currentCard = null;
//             }, 300);
//         })
//         .catch(error => {
//             console.error('Error deleting department:', error);
//             console.error('Error details:', error.response?.data);
//             alert('Failed to delete department. Please try again.');
//         });
// }

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

    // Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Create Department Form
    const createForm = document.querySelector('#popupCreate form');
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createNewDepartment();
        });
    }

    // Edit Department Form
    const editForm = document.querySelector('#popupEdit form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            confirmEditDepartment();
        });
    }
});
    
    // Explicitly expose functions to window object
    // window.openEditPopup = openEditPopup;
    // window.closeEditPopup = closeEditPopup;
    // window.handleEditKeyPress = handleEditKeyPress;
    // window.saveDepartmentName = saveDepartmentName;
    // window.openCreatePopup = openCreatePopup;
    // window.closeCreatePopup = closeCreatePopup;
    // window.createDepartment = createDepartment;
    // window.openDeleteConfirmation = openDeleteConfirmation;
    // window.closeDeletePopup = closeDeletePopup;
    // window.deleteDepartment = deleteDepartment;
    // window.previewImage = previewImage;
});

// Create Department
async function createNewDepartment() {
    const form = document.getElementById('createDepartmentForm');
    const nameInput = form.querySelector('.input-text-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('กรุณากรอกชื่อหน่วยงาน');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);
        
        console.log('Sending create request with:', name);
        
        const response = await axios.post('/departments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });
        
        console.log('Create response:', response);
        
        if (response.data.success) {
            const container = document.querySelector('.content-container');
            container.insertAdjacentHTML('beforeend', response.data.html);
            closeCreatePopup();
            nameInput.value = '';
            location.reload();
        }
    } catch (error) {
        console.error('Create error:', error);
        console.error('Error response:', error.response);
        
        if (error.response && error.response.status === 422) {
            alert('ชื่อหน่วยงานนี้มีอยู่แล้ว');
        } else {
            alert('ไม่สามารถสร้างหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
        }
    }
}

// Edit Department
async function confirmEditDepartment() {
    if (!currentDepartment) return;
    
    const form = document.getElementById('editDepartmentForm');
    const nameInput = form.querySelector('.input-text-name');
    const newName = nameInput.value.trim();
    const oldName = currentDepartment.getAttribute('data-department');
    
    if (!newName) {
        alert('กรุณากรอกชื่อหน่วยงาน');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('name', newName);
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);
        formData.append('_method', 'PUT');
        
        console.log('Sending edit request:', { oldName, newName });
        
        const response = await axios.post(`/departments/${encodeURIComponent(oldName)}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });
        
        console.log('Edit response:', response);
        
        if (response.data.success) {
            closeEditPopup();
            location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to update department');
        }
    } catch (error) {
        console.error('Edit error:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            alert(error.response.data.message || 'ไม่สามารถแก้ไขหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
        } else {
            console.error('Error:', error.message);
            alert('ไม่สามารถแก้ไขหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
        }
    }
}

// Delete Department
async function deleteDepartment() {
    try {
        const deletePopup = document.getElementById('deleteConfirmationPopup');
        if (!deletePopup) {
            throw new Error('Delete confirmation popup not found');
        }

        const departmentId = deletePopup.getAttribute('data-department-id');
        console.log('Attempting to delete department:', departmentId);

        if (!departmentId) {
            throw new Error('Department ID not found');
        }

        const response = await axios.delete(`/departments/${departmentId}`, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            closeDeleteConfirmation();
            window.location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to delete department');
        }

    } catch (error) {
        console.error('Error deleting department:', error);
        
        // Handle different types of errors
        let errorMessage = 'เกิดข้อผิดพลาดในการลบหน่วยงาน';
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            errorMessage = error.response.data.message || errorMessage;
            console.error('Server Error:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }
        
        alert(errorMessage);
    }
}

// // Popup Handlers
// function closeCreatePopup() {
//     document.getElementById('popupCreate').classList.remove('active');
//     document.getElementById('overlay').classList.remove('active');
// }

// function closeEditPopup() {
//     document.getElementById('popupEdit').classList.remove('active');
//     document.getElementById('overlay').classList.remove('active');
// }

// function closeDeleteConfirmation() {
//     document.getElementById('deleteConfirmationPopup').classList.remove('active');
//     document.getElementById('overlay').classList.remove('active');
// }

function handleEditPopup(element) {
    currentDepartment = element;
    const departmentName = element.getAttribute('data-department');
    const departmentId = element.getAttribute('data-department-id');
    
    console.log('Opening edit popup for department:', { 
        departmentId, 
        departmentName,
        element: element.outerHTML // Debug: show the full element
    });

    if (!departmentId) {
        console.error('Department ID not found. Element attributes:', {
            'data-department': element.getAttribute('data-department'),
            'data-department-id': element.getAttribute('data-department-id'),
            element: element.outerHTML
        });
        return;
    }

    const popup = document.getElementById('popupEdit');
    const nameInput = popup.querySelector('input[name="name"]');
    const idInput = document.getElementById('editDepartmentId');
    
    if (!nameInput || !idInput) {
        console.error('Form inputs not found:', {
            nameInput: !!nameInput,
            idInput: !!idInput
        });
        return;
    }

    nameInput.value = departmentName;
    idInput.value = departmentId;
    
    popup.classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Create Department Form
    const createForm = document.querySelector('#popupCreate form');
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createNewDepartment();
        });
    }

    // Edit Department Form
    const editForm = document.querySelector('#popupEdit form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            confirmEditDepartment();
        });
    }
});

async function openDeleteConfirmationPopup() {
    try {
        // Get the current department data from the edit form
        const editForm = document.getElementById('editDepartmentForm');
        if (!editForm) {
            throw new Error('Edit form not found');
        }

        // Get department ID and name
        const departmentId = document.getElementById('editDepartmentId').value;
        const departmentName = editForm.querySelector('input[name="name"]').value;

        console.log('Department ID:', departmentId); // Debug log
        console.log('Department Name:', departmentName); // Debug log

        if (!departmentId) {
            throw new Error('Department ID not found in edit form');
        }

        // Get delete confirmation popup
        const deletePopup = document.getElementById('deleteConfirmationPopup');
        if (!deletePopup) {
            throw new Error('Delete confirmation popup not found');
        }

        // Set the department ID as a data attribute on the delete popup
        deletePopup.setAttribute('data-department-id', departmentId);

        // Update the department name in the delete confirmation popup
        const nameElement = deletePopup.querySelector('.card-name h3');
        if (nameElement) {
            nameElement.textContent = departmentName;
        } else {
            console.warn('Name element not found in delete popup');
        }

        // Close edit popup and show delete confirmation
        closeEditPopup();
        deletePopup.classList.add('active');
        document.getElementById('overlay').classList.add('active');

    } catch (error) {
        console.error('Error opening delete confirmation:', error);
        console.error('Error details:', {
            editForm: document.getElementById('editDepartmentForm'),
            departmentId: document.getElementById('editDepartmentId')?.value,
            deletePopup: document.getElementById('deleteConfirmationPopup')
        });
        alert('เกิดข้อผิดพลาดในการเปิดหน้าต่างยืนยันการลบ: ' + error.message);
    }
}

// Add this function to handle department filtering
async function filterByDepartment(departmentId) {
    try {
        console.log('Filtering by department:', departmentId);
        
        // Navigate to members page first
        window.location.href = `/members/filter/${departmentId}`;
        
    } catch (error) {
        console.error('Error filtering by department:', error);
        alert('เกิดข้อผิดพลาดในการกรองข้อมูล');
    }
}

// Make the function available globally
window.filterByDepartment = filterByDepartment;

// Export functions for global use
window.createNewDepartment = createNewDepartment;
window.confirmEditDepartment = confirmEditDepartment;
window.deleteDepartment = deleteDepartment;
window.openEditPopup = handleEditPopup; // Export handleEditPopup as openEditPopup
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup;
// window.closeCreatePopup = closeCreatePopup;
// window.closeEditPopup = closeEditPopup;
// window.closeDeleteConfirmation = closeDeleteConfirmation; 



