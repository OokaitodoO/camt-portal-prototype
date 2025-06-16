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

// Drag and drop variables
let draggedElement = null;
let draggedData = null;
let dropTarget = null;

// Add to your existing event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up listeners...');
    
    // Initialize drag and drop functionality
    addDragAndDropStyles();
    
    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
        initializeDragAndDrop();
        // debugDragAndDrop();
    }, 100);
    
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
                closeMembersDeleteConfirmation();
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
            // Note: After reload, drag and drop will be reinitialized automatically
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

// Check for members before deleting department
async function checkMembersBeforeDelete() {
    try {
        const deletePopup = document.getElementById('deleteConfirmationPopup');
        const departmentId = deletePopup.getAttribute('data-department-id');
        
        if (!departmentId) {
            throw new Error('Department ID not found');
        }

        console.log('Checking members for department:', departmentId);

        // Check if department has members and tasks
        const response = await axios.get(`/departments/${departmentId}/members-count`, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            }
        });

        if (response.data.success) {
            const { memberCount, taskCount } = response.data;
            
            if (memberCount > 0 || taskCount > 0) {
                // Show members/tasks confirmation popup
                showMembersDeleteConfirmation(departmentId, memberCount, taskCount);
            } else {
                // No members or tasks, proceed with normal deletion
                deleteDepartment();
            }
        } else {
            throw new Error('Failed to check department members');
        }

    } catch (error) {
        console.error('Error checking department members:', error);
        
        // If the endpoint doesn't exist yet, proceed with normal deletion
        if (error.response && error.response.status === 404) {
            console.log('Members count endpoint not available, proceeding with normal deletion');
            deleteDepartment();
        } else {
            alert('เกิดข้อผิดพลาดในการตรวจสอบข้อมูลหน่วยงาน');
        }
    }
}

// Show members delete confirmation popup
async function showMembersDeleteConfirmation(departmentId, memberCount, taskCount) {
    try {
        // Get department data for the new popup
        const response = await axios.get(`/departments/${departmentId}/data`);
        if (!response.data.success) {
            throw new Error('Failed to fetch department data');
        }

        const department = response.data.department;
        const membersPopup = document.getElementById('deleteMembersConfirmationPopup');
        
        // Set department data in the new popup
        membersPopup.setAttribute('data-department-id', departmentId);
        membersPopup.querySelector('.card-name h3').textContent = department.name;
        
        // Set department logo
        const logoImg = membersPopup.querySelector('.card-logo-img');
        if (department.icon_path) {
            logoImg.src = `/storage/${department.icon_path}`;
        } else {
            logoImg.src = 'https://placehold.co/128';
        }

        // Set member and task counts
        document.getElementById('memberCount').textContent = memberCount;
        document.getElementById('taskCount').textContent = taskCount;

        // Close the first popup
        closeDeleteConfirmation();

        // Show the new popup
        membersPopup.classList.add('active');
        document.getElementById('overlay').classList.add('active');
        document.body.classList.add('lock-scroll');

    } catch (error) {
        console.error('Error showing members delete confirmation:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยงาน');
    }
}

// Close members delete confirmation popup
function closeMembersDeleteConfirmation() {
    const popup = document.getElementById('deleteMembersConfirmationPopup');
    const overlay = document.getElementById('overlay');
    
    if (popup) popup.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('lock-scroll');
}

// Delete department with all members and tasks
async function deleteDepartmentWithMembers() {
    try {
        const membersPopup = document.getElementById('deleteMembersConfirmationPopup');
        const departmentId = membersPopup.getAttribute('data-department-id');
        
        if (!departmentId) {
            throw new Error('Department ID not found');
        }

        console.log('Deleting department with members and tasks:', departmentId);

        const response = await axios.delete(`/departments/${departmentId}/with-members`, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            }
        });

        console.log('Server response:', response.data);

        if (response.data.success) {
            closeMembersDeleteConfirmation();
            // Redirect to departments page
            window.location.href = '/departments';
        } else {
            throw new Error(response.data.message || 'Failed to delete department with members');
        }

    } catch (error) {
        console.error('Error deleting department with members:', error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการลบหน่วยงาน';
        
        if (error.response) {
            if (error.response.status === 403) {
                errorMessage = 'คุณไม่มีสิทธิ์ในการลบหน่วยงาน';
            } else if (error.response.status === 400) {
                errorMessage = error.response.data.message;
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            console.error('Server Error:', error.response.data);
        } else if (error.request) {
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
window.checkMembersBeforeDelete = checkMembersBeforeDelete;
window.showMembersDeleteConfirmation = showMembersDeleteConfirmation;
window.closeMembersDeleteConfirmation = closeMembersDeleteConfirmation;
window.deleteDepartmentWithMembers = deleteDepartmentWithMembers;

// Make drag and drop functions available globally
window.initializeDragAndDrop = initializeDragAndDrop;
window.addDragAndDropStyles = addDragAndDropStyles;

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

        // Close the edit popup if it's open
        const editPopup = document.getElementById('popupEdit');
        if (editPopup) {
            editPopup.classList.remove('active');
            document.getElementById('overlay').classList.remove('active');
            document.body.classList.remove('lock-scroll');
        }

         // Show popup
         popup.classList.add('active');
         document.getElementById('overlay').classList.add('active');
         document.body.classList.add('lock-scroll');

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

// // Add notification function if not already present
// function showNotification(type, message) {
//     // You can implement this based on your UI needs
//     alert(message); // Basic implementation, replace with your notification system
// }

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

// Add this function for searching departments
function searchDepartments(searchTerm) {
    const contentContainer = document.querySelector('.content-container');
    const departmentCards = document.querySelectorAll('.card-wrapper');
    const searchTermLower = searchTerm.toLowerCase().trim();
    let hasVisibleCards = false;

    departmentCards.forEach(card => {
        const departmentName = card.querySelector('.department-name').textContent.toLowerCase();
        
        if (departmentName.includes(searchTermLower)) {
            card.classList.remove('hidden');
            card.style.display = ''; // Show the card
            card.style.animation = 'fadeIn 0.5s ease-in-out';
            hasVisibleCards = true;
        } else {
            card.classList.add('hidden');
            card.style.display = 'none'; // Hide the card
        }
    });

    // Show no results message if needed
    let noResultsMsg = document.getElementById('noResultsMessage');
    if (!hasVisibleCards) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'no-results sarabun-24';
            noResultsMsg.textContent = 'ไม่พบหน่วยงานที่ค้นหา';
            contentContainer.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
    }
}

// Add event listener for search input
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchDepartments(e.target.value);
        });

        // Add clear search functionality
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                searchDepartments('');
            }
        });
    }
});

// Make the function available globally
window.searchDepartments = searchDepartments;

// Add drag and drop functionality
function initializeDragAndDrop() {
    console.log('Initializing drag and drop...');
    const cardWrappers = document.querySelectorAll('.card-wrapper');
    console.log('Found card wrappers:', cardWrappers.length);
    
    cardWrappers.forEach((card, index) => {
        // Only make cards draggable for admin users
        const userRole = document.querySelector('meta[name="user-role"]').content;
        // console.log('User role:', userRole);
        
        if (userRole === 'admin') {
            // Remove any existing listeners first
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            // Set draggable attribute
            newCard.setAttribute('draggable', 'true');
            newCard.style.cursor = 'grab';
            
            // console.log(`Setting up drag for card ${index}:`, newCard);
            
            // Add drag event listeners
            newCard.addEventListener('dragstart', handleDragStart);
            newCard.addEventListener('dragover', handleDragOver);
            newCard.addEventListener('dragenter', handleDragEnter);
            newCard.addEventListener('dragleave', handleDragLeave);
            newCard.addEventListener('drop', handleDrop);
            newCard.addEventListener('dragend', handleDragEnd);
            
            // Test event listener
            newCard.addEventListener('mousedown', function(e) {
                console.log('Mouse down on card:', this.getAttribute('data-department-id'));
            });
            
        } else {
            card.setAttribute('draggable', 'false');
            card.style.cursor = 'default';
        }
    });
    
    console.log('Drag and drop initialization complete');
}

function handleDragStart(e) {
    console.log('handleDragStart called on:', this);
    
    draggedElement = this;
    draggedData = {
        id: this.getAttribute('data-department-id'),
        order: this.getAttribute('data-department-order')
    };
    
    console.log('Drag started for department:', draggedData);
    
    // Add visual feedback
    this.classList.add('dragging');
    this.style.opacity = '0.5';
    this.style.transform = 'rotate(5deg)';
    this.style.zIndex = '1000';
    this.style.cursor = 'grabbing';
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    
    // Prevent default click behavior during drag
    const cardContainer = this.querySelector('.card-container');
    if (cardContainer) {
        cardContainer.style.pointerEvents = 'none';
    }
    
    // Stop propagation to prevent conflicts
    e.stopPropagation();
    
    console.log('Drag start setup complete');
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this !== draggedElement && draggedElement) {
        console.log('Drag enter on:', this.getAttribute('data-department-id'));
        this.classList.add('drag-over');
        
        // Simple highlight for swap, no insertion indicators
        this.style.background = 'rgba(0,123,255,0.1)';
    }
}

function handleDragLeave(e) {
    // Only remove classes if we're actually leaving the element
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
        this.style.background = '';
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Drop event on:', this.getAttribute('data-department-id'));
    
    if (this !== draggedElement && draggedElement) {
        // Simple swap logic
        swapCards(draggedElement, this);
    }
    
    // Clean up
    document.querySelectorAll('.card-wrapper').forEach(card => {
        card.classList.remove('drag-over');
        card.style.background = '';
    });
    
    return false;
}

function swapCards(card1, card2) {
    console.log('Swapping cards:', {
        card1Id: card1.getAttribute('data-department-id'),
        card2Id: card2.getAttribute('data-department-id')
    });
    
    // Get the parent container
    const container = document.querySelector('.content-container');
    
    // Create a temporary placeholder
    const placeholder = document.createElement('div');
    placeholder.style.display = 'none';
    
    // Insert placeholder right before card1
    container.insertBefore(placeholder, card1);
    
    // Move card1 to where card2 is (before card2)
    container.insertBefore(card1, card2);
    
    // Move card2 to where card1 was (where placeholder is)
    container.insertBefore(card2, placeholder);
    
    // Remove the placeholder
    placeholder.remove();
    
    console.log('Swap completed successfully');
    
    // Update order attributes
    updateCardOrders();
    
    // Save new order to backend
    saveCardOrder();
}

function handleDragEnd(e) {
    console.log('Drag end');
    
    // Clean up all visual feedback
    document.querySelectorAll('.card-wrapper').forEach(card => {
        card.classList.remove('dragging', 'drag-over', 'insert-before', 'insert-after');
        card.style.opacity = '';
        card.style.transform = '';
        card.style.zIndex = '';
        card.style.cursor = 'grab';
        
        // Re-enable click events
        const cardContainer = card.querySelector('.card-container');
        if (cardContainer) {
            cardContainer.style.pointerEvents = '';
        }
    });
    
    draggedElement = null;
    draggedData = null;
    dropTarget = null;
}

function updateCardOrders() {
    const cards = document.querySelectorAll('.card-wrapper');
    cards.forEach((card, index) => {
        card.setAttribute('data-department-order', index);
    });
}

async function saveCardOrder() {
    try {
        const cards = document.querySelectorAll('.card-wrapper');
        const orderData = Array.from(cards).map((card, index) => ({
            id: parseInt(card.getAttribute('data-department-id')),
            order: index
        }));
        
        console.log('Saving new order:', orderData);
        
        const response = await axios.post('/departments/reorder', {
            departments: orderData
        }, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('Order saved successfully');
            showNotification('success', 'ลำดับหน่วยงานได้รับการบันทึกแล้ว');
        } else {
            throw new Error('Failed to save order');
        }
        
    } catch (error) {
        console.error('Error saving card order:', error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกลำดับหน่วยงาน';
        
        if (error.response) {
            console.log('Server response:', error.response.data);
            
            // Check for specific error cases
            if (error.response.status === 400) {
                const serverMessage = error.response.data.message;
                if (serverMessage && serverMessage.includes('Order column not found')) {
                    errorMessage = 'ต้องเพิ่มคอลัมน์ order ในฐานข้อมูลก่อน - กรุณาเรียกใช้ SQL commands';
                    showNotification('warning', errorMessage);
                    console.warn('❌ DATABASE SETUP REQUIRED ❌');
                    console.warn('Please run the SQL commands to add the order column:');
                    console.warn('ALTER TABLE departments ADD COLUMN `order` INT DEFAULT 0 AFTER icon_path;');
                    return; // Don't show generic error
                } else {
                    errorMessage = serverMessage || errorMessage;
                }
            } else if (error.response.status === 405) {
                console.warn('Reorder endpoint not available - this is expected during development');
                showNotification('info', 'การเรียงลำดับได้ถูกบันทึกชั่วคราว (รอการอัพเดทฐานข้อมูล)');
                return; // Don't reload page for this error
            }
        }
        
        showNotification('error', errorMessage);
        
        // Only reload page for other types of errors
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Add CSS styles for drag and drop feedback
function addDragAndDropStyles() {
    if (document.getElementById('dragDropStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'dragDropStyles';
    style.textContent = `
        .card-wrapper {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            position: relative;
        }
        
        .card-wrapper[draggable="true"] {
            cursor: grab !important;
        }
        
        .card-wrapper[draggable="true"]:active {
            cursor: grabbing !important;
        }
        
        .card-wrapper.dragging {
            transform: rotate(5deg) scale(1.05) !important;
            z-index: 1000 !important;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3) !important;
            opacity: 0.8 !important;
            cursor: grabbing !important;
        }
        
        .card-wrapper.drag-over {
            transform: scale(1.02) !important;
            box-shadow: 0 4px 12px rgba(244, 142, 46, 0.3) !important;
            background: rgba(244, 142, 46, 0.1) !important;
            border-radius: 30px !important;
        }
        
        .content-container {
            min-height: 200px;
        }
        
        /* Ensure drag doesn't interfere with card content */
        .card-wrapper.dragging .card-container {
            pointer-events: none !important;
        }
        
        /* Add visual feedback for admin users */
        .card-wrapper[draggable="true"]::before {            
            position: absolute;
            top: 10px;
            right: 10px;
            color: #ccc;
            font-size: 16px;
            line-height: 8px;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .card-wrapper[draggable="true"]:hover::before {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    console.log('Drag and drop styles added');
}

// Enhanced notification function
function showNotification(type, message) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.drag-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `drag-notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-family: 'Sarabun', sans-serif;
        ${type === 'success' ? 'background: #28a745;' : 
          type === 'warning' ? 'background: #ffc107; color: #212529;' : 
          type === 'info' ? 'background: #17a2b8;' : 'background: #dc3545;'}
    `;
    
    // Add animation keyframes if not exists
    if (!document.getElementById('notificationStyles')) {
        const notificationStyle = document.createElement('style');
        notificationStyle.id = 'notificationStyles';
        notificationStyle.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(notificationStyle);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Debug function to check drag and drop setup
function debugDragAndDrop() {
    console.log('=== DRAG AND DROP DEBUG ===');
    const cardWrappers = document.querySelectorAll('.card-wrapper');
    const userRole = document.querySelector('meta[name="user-role"]').content;
    
    console.log('User role:', userRole);
    console.log('Total card wrappers found:', cardWrappers.length);
    
    cardWrappers.forEach((card, index) => {
        const isDraggable = card.getAttribute('draggable');
        const departmentId = card.getAttribute('data-department-id');
        const cursor = window.getComputedStyle(card).cursor;
        
        console.log(`Card ${index}:`, {
            departmentId,
            isDraggable,
            cursor,
            hasMouseDown: card.onmousedown !== null,
            hasDragStart: card.ondragstart !== null
        });
        
        // Test if the element responds to mouse events
        card.addEventListener('mouseenter', function() {
            console.log('Mouse entered card:', departmentId);
        }, { once: true });
    });
    
    console.log('=== END DEBUG ===');
}




