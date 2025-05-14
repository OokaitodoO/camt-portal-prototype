import {
    // closeCreatePopup,
    // openEditPopup,
    // closeEditPopup,
    // openDeleteConfirmationPopup,
    closeDeleteConfirmation
} from './component/button.js';
import axios from 'axios';

console.log('Department JS loaded');

let currentCard = null;
let departmentToDelete = null;
let currentDepartment = null;

// Add a flag to track submission status
let isSubmitting = false;

// Add a flag to track edit submission status
let isEditing = false;

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

    // Remove all previous event listeners for create form
    const createForm = document.getElementById('createDepartmentForm');
    if (createForm) {
        // Remove any existing listeners by cloning
        const newCreateForm = createForm.cloneNode(true);
        createForm.parentNode.replaceChild(newCreateForm, createForm);
        
        // Add single event listener with submission tracking
        newCreateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!isSubmitting) {
                createNewDepartment(e);
            } else {
                console.log('Form submission already in progress');
            }
        });
    }

    // Remove the duplicate DOMContentLoaded listeners
    const existingListeners = document.querySelectorAll('[data-listener="create-department"]');
    existingListeners.forEach(listener => listener.remove());
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

// Preview image before upload
document.getElementById('departmentLogo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('createLogoPreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Create department function
async function createNewDepartment(event) {
    event.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
        console.log('Submission already in progress');
        return;
    }
    
    const form = document.getElementById('createDepartmentForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    try {
        // Set submission flag
        isSubmitting = true;
        
        // Disable the submit button
        submitButton.disabled = true;
        submitButton.innerHTML = '<p>กำลังสร้าง...</p>';

        const formData = new FormData(form);
        
        // Debug logging
        console.log('Form data being sent:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
        }

        const response = await axios.post('/departments', formData, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json',
            }
        });

        console.log('Server response:', response.data);

        if (response.data.success) {
            // Close popup and reset form
            closeCreatePopup();
            form.reset();
            document.getElementById('createLogoPreview').src = 'https://placehold.co/128';
            
            // Redirect to refresh the page
            window.location.href = '/department';
            return; // Exit the function after redirecting
        } else {
            throw new Error(response.data.message || 'Failed to create department');
        }

    } catch (error) {
        console.error('Create error:', error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการสร้างหน่วยงาน';
        
        if (error.response) {
            if (error.response.status === 403) {
                errorMessage = 'คุณไม่มีสิทธิ์ในการสร้างหน่วยงาน';
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        }
        
        alert(errorMessage);
    } finally {
        // Reset submission flag and button state
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Popup functions
function openCreatePopup() {
    document.getElementById('popupCreate').style.display = 'flex';
    document.getElementById('overlay').style.display = 'block';
}

function closeCreatePopup() {
    document.getElementById('popupCreate').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('createDepartmentForm').reset();
    document.getElementById('createLogoPreview').src = 'https://placehold.co/128';
}

function createDepartmentCard(department) {
    const iconPath = department.icon_path 
        ? `/storage/${department.icon_path}` 
        : 'https://placehold.co/128';
        
    return `
        <div class="card-container" data-department-id="${department.id}">
            <div class="card">
                <div class="card-header">
                    <div class="btn-edit" onclick="openEditPopup(this)" data-department-id="${department.id}">
                        <i class="fas fa-edit"></i>
                    </div>
                </div>
                <div class="card-content" onclick="window.location.href='/members/filter/${department.id}'">
                    <div class="card-logo">
                        <img src="${iconPath}" class="card-logo-img" alt="logo">
                    </div>
                    <hr class="divider">
                    <div class="card-container-info">
                        <div class="card-name sarabun-20">
                            <h3>${department.name}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update confirmEditDepartment function
async function confirmEditDepartment() {
    if (isEditing) {
        console.log('Edit already in progress');
        return;
    }

    const form = document.getElementById('editDepartmentForm');
    const submitButton = form?.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.innerHTML || '<p>ตกลง</p>';

    try {
        if (!form) {
            throw new Error('Edit form not found');
        }

        const departmentId = document.getElementById('editDepartmentId').value;
        console.log('Updating department ID:', departmentId);

        if (!departmentId) {
            throw new Error('Department ID not found');
        }

        if (!submitButton) {
            throw new Error('Submit button not found');
        }

        // Set editing flag and disable submit button
        isEditing = true;
        submitButton.disabled = true;
        submitButton.innerHTML = '<p>กำลังแก้ไข...</p>';

        const formData = new FormData(form);
        
        // Debug logging
        console.log('Form data being sent:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
        }

        const response = await axios.post(`/departments/${departmentId}/update`, formData, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Server response:', response.data);

        if (response.data.success) {
            closeEditPopup();
            window.location.href = '/department';
            return;
        } else {
            throw new Error(response.data.message || 'Failed to update department');
        }

    } catch (error) {
        console.error('Edit error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response,
            request: error.request
        });
        
        let errorMessage = 'เกิดข้อผิดพลาดในการแก้ไขหน่วยงาน';
        
        if (error.response) {
            if (error.response.status === 403) {
                errorMessage = 'คุณไม่มีสิทธิ์ในการแก้ไขหน่วยงาน';
            } else if (error.response.status === 404) {
                errorMessage = 'ไม่พบหน่วยงานที่ต้องการแก้ไข';
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        }
        
        alert(errorMessage);
    } finally {
        // Reset editing flag
        isEditing = false;
        
        // Reset button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }
}

// Event listener setup
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editDepartmentForm');
    if (editForm) {
        const newEditForm = editForm.cloneNode(true);
        editForm.parentNode.replaceChild(newEditForm, editForm);
        
        newEditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!isEditing) {
                confirmEditDepartment();
            } else {
                console.log('Edit already in progress');
            }
        });
    }
});

// Make function available globally
window.confirmEditDepartment = confirmEditDepartment;

// Update closeEditPopup function if needed
function closeEditPopup() {
    const popup = document.getElementById('popupEdit');
    const overlay = document.getElementById('overlay');
    if (popup) popup.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    
    // Reset form if it exists
    const form = document.getElementById('editDepartmentForm');
    if (form) form.reset();
    
    // Reset logo preview if it exists
    const logoPreview = document.getElementById('editLogoPreview');
    if (logoPreview) logoPreview.src = 'https://placehold.co/128';
}

// Make sure closeEditPopup is available globally
window.closeEditPopup = closeEditPopup;

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
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            }
        });

        console.log('Server response:', response.data);

        if (response.data.success) {
            closeDeleteConfirmation();
            // Redirect to refresh the page
            window.location.href = '/department';
        } else {
            throw new Error(response.data.message || 'Failed to delete department');
        }

    } catch (error) {
        console.error('Error deleting department:', error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการลบหน่วยงาน';
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 403) {
                errorMessage = 'คุณไม่มีสิทธิ์ในการลบหน่วยงาน';
            } else if (error.response.status === 400) {
                errorMessage = error.response.data.message;
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            console.error('Server Error:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
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
            createNewDepartment(e);
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
window.deleteDepartment = deleteDepartment;
window.openEditPopup = handleEditPopup; // Export handleEditPopup as openEditPopup
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup;

async function openEditPopup(element) {
    try {
        const departmentId = element.getAttribute('data-department-id');
        if (!departmentId) {
            throw new Error('Department ID not found');
        }

        console.log('Opening edit for department:', departmentId); // Debug log

        // Fetch department data
        const response = await axios.get(`/departments/${departmentId}/data`);
        if (!response.data.success) {
            throw new Error('Failed to fetch department data');
        }

        const department = response.data.department;
        
        // Get the edit form
        const form = document.getElementById('editDepartmentForm');
        
        // Set form values
        document.getElementById('editDepartmentId').value = departmentId;
        form.querySelector('input[name="name"]').value = department.name;

        // Set logo preview
        const logoPreview = document.getElementById('editLogoPreview');
        if (department.icon_path) {
            // Check if the path already includes storage/
            const iconPath = department.icon_path.startsWith('storage/') 
                ? department.icon_path 
                : `storage/${department.icon_path}`;
            logoPreview.src = `/${iconPath}`;
        } else {
            logoPreview.src = 'https://placehold.co/128';
        }

        // Show popup
        document.getElementById('popupEdit').classList.add('active');
        document.getElementById('overlay').classList.add('active');

    } catch (error) {
        console.error('Error opening edit popup:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยงาน');
    }
}

// Make sure the function is available globally
window.openEditPopup = openEditPopup;

// Add notification function if not already present
function showNotification(type, message) {
    // You can implement this based on your UI needs
    alert(message); // Basic implementation, replace with your notification system
}




