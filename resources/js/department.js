import {
    openCreatePopup,
    closeCreatePopup,
    // openEditPopup,
    closeEditPopup,
    // openDeleteConfirmationPopup,
    closeDeleteConfirmation
} from './component/button.js';
import axios from 'axios';

console.log('Department JS loaded');

let currentCard = null;
let departmentToDelete = null;
let currentDepartment = null;

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
});

// Add logo preview functionality
document.addEventListener('DOMContentLoaded', () => {
    // Create logo preview
    const createLogoInput = document.getElementById('departmentLogo');
    const createLogoPreview = document.getElementById('createLogoPreview');
    
    if (createLogoInput && createLogoPreview) {
        createLogoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    createLogoPreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Edit logo preview
    const editLogoInput = document.getElementById('editDepartmentLogo');
    const editLogoPreview = document.getElementById('editLogoPreview');
    
    if (editLogoInput && editLogoPreview) {
        editLogoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editLogoPreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
});

// Update createNewDepartment function
async function createNewDepartment() {
    const form = document.getElementById('createDepartmentForm');
    const nameInput = form.querySelector('.input-text-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('กรุณากรอกชื่อหน่วยงาน');
        return;
    }

    try {
        const formData = new FormData(form);
        
        const response = await axios.post('/departments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });
        
        if (response.data.success) {
            closeCreatePopup();
            location.reload();
        }
    } catch (error) {
        console.error('Create error:', error);
        if (error.response?.status === 422) {
            alert('ชื่อหน่วยงานนี้มีอยู่แล้ว');
        } else {
            alert('ไม่สามารถสร้างหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
        }
    }
}

// Update confirmEditDepartment function
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
        const formData = new FormData(form);
        formData.append('_method', 'PUT');
        
        const response = await axios.post(`/departments/${encodeURIComponent(oldName)}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });
        
        if (response.data.success) {
            closeEditPopup();
            location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to update department');
        }
    } catch (error) {
        console.error('Edit error:', error);
        if (error.response) {
            alert(error.response.data.message || 'ไม่สามารถแก้ไขหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
        } else {
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




