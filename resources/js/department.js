import {
    // closeCreatePopup,
    // openEditPopup,
    // closeEditPopup,
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
        let mouseDownOnPopup = false;

        // Track if mouse down started inside popup
        overlay.querySelector('.popup-content').addEventListener('mousedown', () => {
            mouseDownOnPopup = true;
        });

        // Reset flag when mouse is released
        document.addEventListener('mouseup', () => {
            mouseDownOnPopup = false;
        });

        // Only close if click started and ended on overlay
        overlay.addEventListener('mousedown', function(event) {
            if (event.target === this) {
                mouseDownOnPopup = false;
            }
        });

        overlay.addEventListener('mouseup', function(event) {
            if (event.target === this && !mouseDownOnPopup) {
                closeEditPopup();
                closeDeleteConfirmation();
                closeCreatePopup();
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
                createDepartment(e);
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

// Create department
async function createDepartment(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('createDepartmentForm');
        const formData = new FormData(form);

        const response = await axios.post('/departments/create', formData, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            window.location.reload();
        }

    } catch (error) {
        console.error('Create error:', error);
        alert('เกิดข้อผิดพลาดในการสร้างหน่วยงาน');
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

// Edit department
async function confirmEditDepartment(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('editDepartmentForm');
        const formData = new FormData(form);
        const departmentId = document.getElementById('editDepartmentId').value;

        console.log('Submitting update:', {
            departmentId,
            name: formData.get('name'),
            hasFile: formData.get('icon') !== null
        });

        const response = await axios.post(`/departments/${departmentId}/update`, formData, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        });

        if (response.data.success) {
            // Close popup
            const popup = document.getElementById('popupEdit');
            const overlay = document.getElementById('overlay');
            popup.classList.remove('active');
            overlay.classList.remove('active');
            
            // Refresh page
            window.location.reload();
        }

    } catch (error) {
        console.error('Edit error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        alert('เกิดข้อผิดพลาดในการอัพเดตหน่วยงาน');
    }
}

// Make sure it's globally available
window.confirmEditDepartment = confirmEditDepartment;

// Add form submit listener
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editDepartmentForm');
    if (editForm) {
        editForm.addEventListener('submit', confirmEditDepartment);
    }
});

// Update closeEditPopup function if needed
function closeEditPopup() {
    const popup = document.getElementById('popupEdit');
    const overlay = document.getElementById('overlay');
    if (popup) popup.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('lock-scroll');
    
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
            // Change from '/department' to '/departments'
            window.location.href = '/departments';
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
window.createDepartment = createDepartment;
window.deleteDepartment = deleteDepartment;

async function openDeleteConfirmationPopup(departmentId) {
    try {
        console.log('Opening delete confirmation for department:', departmentId);

        if (!departmentId) {
            throw new Error('Department ID is required');
        }

        // Fetch department data
        const response = await axios.get(`/departments/${departmentId}/data`);
        if (!response.data.success) {
            throw new Error('Failed to fetch department data');
        }

        const department = response.data.department;
        const popup = document.getElementById('deleteConfirmationPopup');
        
        // Set department data in popup
        popup.setAttribute('data-department-id', departmentId);
        popup.querySelector('.card-name h3').textContent = department.name;
        
        // Set department logo
        const logoImg = popup.querySelector('.card-logo-img');
        if (department.icon_path) {
            logoImg.src = `/storage/${department.icon_path}`;
        } else {
            logoImg.src = 'https://placehold.co/128';
        }

        // Show popup
        popup.classList.add('active');
        document.getElementById('overlay').classList.add('active');
        document.body.classList.add('lock-scroll');

        // Close the edit popup if it's open
        const editPopup = document.getElementById('popupEdit');
        if (editPopup) {
            editPopup.classList.remove('active');
            document.getElementById('overlay').classList.remove('active');
            document.body.classList.remove('lock-scroll');
        }

    } catch (error) {
        console.error('Error opening delete confirmation:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยงาน');
    }
}

// Update openEditPopup function
async function openEditPopup(element) {
    try {
        const departmentId = element.getAttribute('data-department-id');
        console.log('Opening edit popup for department ID:', departmentId);

        if (!departmentId) {
            throw new Error('Department ID not found');
        }

        // Fetch department data
        const response = await axios.get(`/departments/${departmentId}/data`, {
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (!response.data.success) {
            throw new Error('Failed to fetch department data');
        }

        const department = response.data.department;

        // Get popup elements
        const popup = document.getElementById('popupEdit');
        const form = document.getElementById('editDepartmentForm');
        const idInput = document.getElementById('editDepartmentId');
        const nameInput = form.querySelector('input[name="name"]');
        const logoPreview = document.getElementById('editLogoPreview');

        // Set values
        idInput.value = department.id;
        nameInput.value = department.name;

        // Set logo preview
        if (department.icon_path) {
            logoPreview.src = `/storage/${department.icon_path}`;
        } else {
            logoPreview.src = 'https://placehold.co/128';
        }

        // Show popup
        popup.classList.add('active');
        document.getElementById('overlay').classList.add('active');
        document.body.classList.add('lock-scroll');
    } catch (error) {
        console.error('Error in openEditPopup:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยงาน');
    }
}

// Make functions available globally
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup;
window.openEditPopup = openEditPopup;

// Remove any duplicate event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Remove old listeners from edit buttons
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
});

// Add notification function if not already present
function showNotification(type, message) {
    // You can implement this based on your UI needs
    alert(message); // Basic implementation, replace with your notification system
}

// Add this to help debug the click event
document.addEventListener('DOMContentLoaded', () => {
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('Edit button clicked', {
                button: e.target,
                departmentId: e.target.closest('.card-container')?.getAttribute('data-department-id')
            });
        });
    });
});




