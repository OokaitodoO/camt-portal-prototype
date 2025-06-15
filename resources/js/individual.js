function openEditPopup(element) {
    const taskId = element.getAttribute('data-task-id');
    
    axios.get(`/tasks/${taskId}/edit`)
        .then(response => {
            const task = response.data.task;
            
            // Set form values
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskTitle').value = task.title;
            document.getElementById('editTaskDescription').value = task.description || '';
            document.getElementById('editTaskLink').value = task.link || '';
            
            // Set logo preview
            const logoPreview = document.getElementById('editTaskLogoPreview');
            if (task.logo_path) {
                const cleanPath = task.logo_path
                    .replace(/^storage\//, '')
                    .replace(/^http:\/\/localhost\/storage\//, '')
                    .replace(/^http:\/\/localhost\//, '');
                logoPreview.src = `/storage/${cleanPath}`;
            } else {
                logoPreview.src = 'https://placehold.co/128';
            }
            
            // Set deadline - Keep YYYY-MM-DD format for type="date" input
            const deadlineInput = document.getElementById('editTaskDeadline');
            if (task.deadline) {
                deadlineInput.value = task.deadline; // Already in YYYY-MM-DD format
            } else {
                deadlineInput.value = '';
            }

            // Set assigned member
            if (task.assigned_to_user) {
                document.getElementById('editTaskAssignedTo').value = 
                    `${task.assigned_to_user.first_name} ${task.assigned_to_user.last_name}`;
                document.getElementById('editTaskAssignedToId').value = task.assigned_to;
            }

            // Load subtasks with consistent styling
            const subtasksContainer = document.getElementById('editSubTasksContainer');
            subtasksContainer.innerHTML = ''; // Clear existing subtasks

            if (task.sub_tasks && task.sub_tasks.length > 0) {
                task.sub_tasks.forEach((subtask, index) => {
                    const subtaskHtml = `
                        <div class="popup-sub-task">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ชื่อภาระงานย่อย ${index + 1}</h2>
                                <input type="text" 
                                       name="sub_tasks[${index}][title]" 
                                       value="${subtask.title || ''}" 
                                       class="input-text sarabun-16" 
                                       placeholder="ภาระงานย่อย...">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ลิ้งก์</h2>
                                <input type="text" 
                                       name="sub_tasks[${index}][link]" 
                                       value="${subtask.link || ''}" 
                                       class="input-text sarabun-16" 
                                       placeholder="ลิ้งก์...">
                                <input type="hidden" 
                                       name="sub_tasks[${index}][id]" 
                                       value="${subtask.id}">
                            </div>
                            <div class="remove-subtask-btn btn-pointer" onclick="removeSubTask(this, 'edit')">
                                <i class="fas fa-trash-alt"></i>
                            </div>
                        </div>
                    `;
                    subtasksContainer.insertAdjacentHTML('beforeend', subtaskHtml);
                });
            }

            // Show the popup and initialize date picker
            document.getElementById('popupEdit').classList.add('active');
            document.getElementById('overlay').classList.add('active');
            document.body.classList.add('lock-scroll');
        })
        .catch(error => {
            console.error('Error fetching task:', error);
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        });
}

async function updateTask() {
    try {
        const form = document.getElementById('editTaskForm');
        const taskId = document.getElementById('editTaskId').value;
        const formData = new FormData(form);

        // Collect validation errors
        const errors = [];
        let firstErrorField = null;

        // Validate required fields
        const titleInput = document.getElementById('editTaskTitle');
        const linkInput = document.getElementById('editTaskLink');
        const assignedToInput = document.getElementById('editTaskAssignedTo');
        const deadlineInput = document.getElementById('editTaskDeadline');
        
        // Check title
        if (!titleInput.value || !titleInput.value.trim()) {
            errors.push('กรุณากรอกชื่อภาระงาน');
            if (!firstErrorField) firstErrorField = titleInput;
        }

        // Check link
        if (!linkInput.value || !linkInput.value.trim()) {
            errors.push('กรุณากรอกลิ้งก์');
            if (!firstErrorField) firstErrorField = linkInput;
        }

        // Check assigned member (even though it's readonly, should have a value)
        if (!assignedToInput.value || !assignedToInput.value.trim()) {
            errors.push('กรุณาตรวจสอบผู้รับผิดชอบ');
            if (!firstErrorField) firstErrorField = assignedToInput;
        }

        // If there are validation errors, show them and stop
        if (errors.length > 0) {
            const errorMessage = errors.join('\n');
            alert(errorMessage);
            if (firstErrorField) {
                firstErrorField.focus();
            }
            return;
        }

        // Handle the date input
        if (deadlineInput && deadlineInput.value) {
            // Convert from dd/mm/yyyy to yyyy-mm-dd if needed
            const [day, month, year] = deadlineInput.value.split('/');
            if (day && month && year) {
                const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                formData.set('deadline', formattedDate);
            } else {
                // If the date is already in yyyy-mm-dd format
                formData.set('deadline', deadlineInput.value);
            }
        } else {
            formData.delete('deadline');
        }

        // Handle subtasks
        const subtasks = Array.from(document.querySelectorAll('#editSubTasksContainer .popup-sub-task'))
            .map(subtask => ({
                id: subtask.querySelector('input[name*="[id]"]')?.value,
                title: subtask.querySelector('input[name*="[title]"]')?.value?.trim() || '',
                link: subtask.querySelector('input[name*="[link]"]')?.value?.trim() || ''
            }))
            .filter(subtask => subtask.title !== '');

        formData.set('sub_tasks', JSON.stringify(subtasks));

        const response = await axios.post(`/tasks/${taskId}/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            location.reload();
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.error('Error updating task:', error);
        alert('เกิดข้อผิดพลาดในการอัปเดตภาระงาน: ' + (error.response?.data?.message || error.message));
    }
}

// Helper function to validate date format
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}

// Initialize member search when document is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof setupMemberSearch === 'undefined') {
        // If task.js hasn't loaded yet, wait a bit and try again
        setTimeout(initializeMemberSearch, 100);
        return;
    }

    const createMemberInput = document.querySelector('#createTaskMemberSearch');
    const createSelectedMembers = document.querySelector('#createSelectedMembers');

    if (createMemberInput && typeof setupMemberSearch === 'function') {
        // Remove any existing dropdowns first
        const existingDropdowns = document.querySelectorAll('.member-search-dropdown');
        existingDropdowns.forEach(dropdown => dropdown.remove());
        
        setupMemberSearch(createMemberInput, createSelectedMembers, 'create');
    }

    // initializeMemberSearch();
});

// Function to initialize member search
function initializeMemberSearch() {
    const createMemberInput = document.querySelector('#createTaskMemberSearch');
    const editMemberInput = document.querySelector('#editTaskMemberSearch');
    const createSelectedMembers = document.querySelector('#createSelectedMembers');
    const editSelectedMembers = document.querySelector('#editSelectedMembers');

    if (createMemberInput) {
        setupMemberSearch(createMemberInput, createSelectedMembers, 'create');
    }
    if (editMemberInput) {
        setupMemberSearch(editMemberInput, editSelectedMembers, 'edit');
    }
}

// Function to setup member search
// function setupMemberSearch(input, selectedContainer, mode) {
//     let dropdownContainer = document.createElement('div');
//     dropdownContainer.className = 'member-search-dropdown';
//     input.parentNode.appendChild(dropdownContainer);

//     let selectedMembers = new Set();

//     input.addEventListener('input', debounce(async (e) => {
//         const query = e.target.value;

//         if (query.length < 2) {
//             dropdownContainer.innerHTML = '';
//             return;
//         }

//         try {
//             const response = await axios.get('/tasks/search-members', {
//                 params: { query }
//             });

//             if (response.data.success) {
//                 if (response.data.members.length === 0) {
//                     dropdownContainer.innerHTML = '<div class="member-search-item">ไม่พบบุคลากร</div>';
//                     return;
//                 }

//                 dropdownContainer.innerHTML = response.data.members
//                     .filter(member => !selectedMembers.has(member.id))
//                     .map(member => `
//                         <div class="member-search-item" onclick="selectSearchedMember(${member.id}, '${member.first_name} ${member.last_name}', '${mode}')">
//                             ${member.first_name} ${member.last_name}
//                             <span class="member-department">${member.department_name || ''}</span>
//                         </div>
//                     `).join('');
//             }
//         } catch (error) {
//             console.error('Error searching members:', error);
//             dropdownContainer.innerHTML = '<div class="member-search-item">เกิดข้อผิดพลาดในการค้นหา</div>';
//         }
//     }, 300));

//     // Close dropdown when clicking outside
//     document.addEventListener('click', function(e) {
//         if (!input.contains(e.target) && !dropdownContainer.contains(e.target)) {
//             dropdownContainer.innerHTML = '';
//         }
//     });

//     // Track selected members
//     selectedMembers = new Set();
//     const updateSelectedMembers = () => {
//         const selectedTags = selectedContainer.querySelectorAll('.selected-member-tag input[type="hidden"]');
//         selectedMembers.clear();
//         selectedTags.forEach(input => selectedMembers.add(parseInt(input.value)));
//     };

//     // Initialize selected members
//     updateSelectedMembers();
// }

// Function to select searched member
// function selectSearchedMember(memberId, memberName, mode) {
//     const container = document.querySelector(`#${mode}SelectedMembers`);
//     const input = document.querySelector(`#${mode}TaskMemberSearch`);
    
//     const memberTag = document.createElement('div');
//     memberTag.className = 'selected-member-tag';
//     memberTag.innerHTML = `
//         ${memberName}
//         <input type="hidden" name="assigned_to[]" value="${memberId}">
//         <span class="remove-member" onclick="removeSearchedMember(this)">&times;</span>
//     `;
    
//     container.appendChild(memberTag);
//     input.value = '';
//     document.querySelector('.member-search-dropdown').innerHTML = '';
// }

// Function to remove searched member
// function removeSearchedMember(element) {
//     element.closest('.selected-member-tag').remove();
// }

// Debounce helper function
// function debounce(func, wait) {
//     let timeout;
//     return function executedFunction(...args) {
//         const later = () => {
//             clearTimeout(timeout);
//             func(...args);
//         };
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//     };
// }

// Make functions globally available
// window.selectSearchedMember = selectSearchedMember;
// window.removeSearchedMember = removeSearchedMember;
window.initializeMemberSearch = initializeMemberSearch;

// Add search functionality for individual tasks
function searchIndividualTasks(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const taskCards = document.querySelectorAll('.card-wrapper');
    let totalVisibleTasks = 0;

    taskCards.forEach(card => {
        const taskTitle = card.querySelector('.card-name h3')?.textContent.toLowerCase() || '';
        
        // Updated selector to match the correct HTML structure
        let assignedBy = '';
        const cardDetails = card.querySelectorAll('.card-details');
        cardDetails.forEach(detail => {
            const label = detail.querySelector('.card-date-title')?.textContent || '';
            if (label.includes('มอบหมายโดย')) {
                assignedBy = detail.querySelector('p:last-child')?.textContent.toLowerCase() || '';
            }
        });
        
        if (searchTerm === '' || 
            taskTitle.includes(searchTerm) || 
            assignedBy.includes(searchTerm)) {
            card.style.opacity = '1';
            card.style.display = '';
            totalVisibleTasks++;
        } else {
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
        card.style.transition = 'opacity 0.3s ease-in-out';
    });

    // Show/hide no results message
    let noResultsMsg = document.getElementById('noResultsMessage');
    if (totalVisibleTasks === 0 && searchTerm !== '') {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'no-results sarabun-24';
            noResultsMsg.textContent = 'ไม่พบภาระงานที่ค้นหา';
            document.querySelector('.content-task').appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
    }
}

// Add event listener when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchIndividualTasks(e);
            }, 300);
        });
    }
});

// Make the function globally available
window.searchIndividualTasks = searchIndividualTasks;

// Profile picture upload handling
document.addEventListener('DOMContentLoaded', function() {
    const profilePreview = document.getElementById('profilePreviewImage');
    const profileInput = document.getElementById('profilePictureInput');

    if (profilePreview && profileInput) {
        // Add click event to the preview image in popup
        profilePreview.addEventListener('click', function() {
            profileInput.click();
        });

        // Handle file selection
        profileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file
            if (!file.type.startsWith('image/')) {
                alert('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
                return;
            }

            // Preview image immediately
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
});

function openProfileUploadPopup(event) {
    if (event) event.preventDefault();
    
    // Get current profile picture
    const currentProfilePic = document.getElementById('individualProfilePreview').src;
    
    // Set the preview image in popup
    const profilePreview = document.getElementById('profilePreviewImage');
    if (profilePreview) {
        profilePreview.src = currentProfilePic;
        profilePreview.setAttribute('data-original-src', currentProfilePic);
    }

    // Show popup
    document.getElementById('profileUploadPopup').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.body.classList.add('lock-scroll');
}

function closeProfileUploadPopup() {
    // Reset the preview image to original
    const profilePreview = document.getElementById('profilePreviewImage');
    if (profilePreview) {
        const originalSrc = profilePreview.getAttribute('data-original-src');
        if (originalSrc) {
            profilePreview.src = originalSrc;
        }
    }

    // Reset file input
    const profileInput = document.getElementById('profilePictureInput');
    if (profileInput) {
        profileInput.value = '';
    }

    // Hide popup
    document.getElementById('profileUploadPopup').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.classList.remove('lock-scroll');
}

async function confirmProfileUpload() {
    const profileInput = document.getElementById('profilePictureInput');
    const file = profileInput.files[0];
    
    if (!file) {
        alert('กรุณาเลือกรูปภาพ');
        return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);
    formData.append('_method', 'PUT');
    formData.append('disk', 'public');
    formData.append('directory', 'members');

    try {
        const memberId = profileInput.getAttribute('data-member-id');
        const response = await axios({
            method: 'post',
            url: `/members/${memberId}/update-profile-picture`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            }
        });

        if (response.data.success) {
            const imagePath = response.data.path;
            
            // Update both preview images with the new path
            const mainProfilePic = document.getElementById('individualProfilePreview');
            const popupPreview = document.getElementById('profilePreviewImage');
            
            // Clean the path to ensure it's in the correct format
            const cleanPath = imagePath.replace(/^public\//, '')
                                     .replace(/^storage\//, '')
                                     .replace(/^members\//, 'members/');
            const fullImageUrl = `/storage/${cleanPath}`;
            
            if (mainProfilePic) {
                mainProfilePic.src = fullImageUrl;
            }
            if (popupPreview) {
                popupPreview.src = fullImageUrl;
                popupPreview.setAttribute('data-original-src', fullImageUrl);
            }
            
            closeProfileUploadPopup();
            window.location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to upload image');
        }
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        
        // Reset preview to original
        const profilePreview = document.getElementById('profilePreviewImage');
        if (profilePreview) {
            const originalSrc = profilePreview.getAttribute('data-original-src');
            if (originalSrc) {
                profilePreview.src = originalSrc;
            }
        }

        if (error.response?.status === 422) {
            const errors = error.response.data.errors;
            const errorMessage = errors ? Object.values(errors).flat().join('\n') : 'Invalid data submitted';
            alert('ข้อผิดพลาดในการตรวจสอบ: ' + errorMessage);
        } else {
            alert('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
        }
    }
}

// Make functions available globally
window.openProfileUploadPopup = openProfileUploadPopup;
window.closeProfileUploadPopup = closeProfileUploadPopup;
window.confirmProfileUpload = confirmProfileUpload;

// Task Drag and Drop functionality
let draggedTaskCard = null;

function initializeTaskDragAndDrop() {
    console.log('Initializing task drag and drop...');
    
    // Check if user has permission to reorder tasks
    const userRole = document.querySelector('meta[name="user-role"]')?.content;
    const currentMemberId = document.querySelector('meta[name="member-id"]')?.content;
    const currentUserId = document.querySelector('meta[name="user-id"]')?.content;
    
    console.log('User role:', userRole, 'Current member:', currentMemberId, 'Current user:', currentUserId);
    
    // Allow reordering if user is admin, headstaff with same department, or viewing their own profile
    const canReorder = userRole === 'admin' || 
                      (userRole === 'headstaff' && currentMemberId === currentUserId) ||
                      currentMemberId === currentUserId;
    
    if (!canReorder) {
        console.log('User does not have permission to reorder tasks');
        return;
    }

    addTaskDragAndDropStyles();
    
    const taskCards = document.querySelectorAll('.card-wrapper');
    console.log('Found task cards:', taskCards.length);
    
    if (taskCards.length === 0) {
        console.log('No task cards found to make draggable');
        return;
    }
    
    taskCards.forEach((card, index) => {
        // Skip if this card is already draggable
        if (card.getAttribute('draggable') === 'true') {
            console.log(`Card ${index} is already draggable, skipping`);
            return;
        }
        
        // Remove any existing listeners first
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        // Set draggable attribute and cursor
        newCard.setAttribute('draggable', 'true');
        newCard.style.cursor = 'grab';
        
        console.log(`Setting up drag for task card ${index}`);
        
        // Add drag event listeners
        newCard.addEventListener('dragstart', handleTaskDragStart);
        newCard.addEventListener('dragover', handleTaskDragOver);
        newCard.addEventListener('dragenter', handleTaskDragEnter);
        newCard.addEventListener('dragleave', handleTaskDragLeave);
        newCard.addEventListener('drop', handleTaskDrop);
        newCard.addEventListener('dragend', handleTaskDragEnd);
        
        // Preserve existing click functionality
        addTaskClickPreservation(newCard);
        
        // Test event listener
        newCard.addEventListener('mousedown', function(e) {
            console.log('Mouse down on task card:', this.dataset.taskId);
        });
    });
    
    console.log('Task drag and drop initialization complete');
}

function handleTaskDragStart(e) {
    draggedTaskCard = this;
    
    // Get task ID from the card
    const taskId = this.querySelector('.card-edit')?.getAttribute('data-task-id') || 
                   this.querySelector('.card-favorite')?.onclick?.toString().match(/toggleFavorite\(event, (\d+)/)?.[1];
    
    console.log('Started dragging task card:', taskId);
    
    // Apply drag styles
    this.classList.add('dragging');
    this.style.opacity = '0.5';
    this.style.transform = 'rotate(5deg)';
    this.style.zIndex = '1000';
    this.style.cursor = 'grabbing';
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    
    // Disable clickable elements during drag
    const clickableElements = this.querySelectorAll('button, .card-favorite, .card-edit, .card-container, .subtasks-dropdown-btn');
    clickableElements.forEach(element => {
        element.style.pointerEvents = 'none';
    });
    
    e.stopPropagation();
}

function handleTaskDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleTaskDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this !== draggedTaskCard && draggedTaskCard) {
        console.log('Drag enter on task card');
        this.classList.add('drag-over');
        
        // Simple highlight for swap
        this.style.background = 'rgba(0,123,255,0.1)';
        this.style.borderRadius = '30px';
    }
}

function handleTaskDragLeave(e) {
    // Only remove classes if we're actually leaving the element
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
        this.style.background = '';
        this.style.borderRadius = '';
    }
}

function handleTaskDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Drop event on task card');
    
    if (this !== draggedTaskCard && draggedTaskCard) {
        // Simple swap logic
        swapTaskCards(draggedTaskCard, this);
    }
    
    // Clean up
    document.querySelectorAll('.card-wrapper[draggable="true"]').forEach(card => {
        card.classList.remove('drag-over');
        card.style.background = '';
        card.style.borderRadius = '';
    });
    
    return false;
}

function handleTaskDragEnd(e) {
    console.log('Task drag end');
    
    // Clean up all visual feedback
    document.querySelectorAll('.card-wrapper[draggable="true"]').forEach(card => {
        card.classList.remove('dragging', 'drag-over');
        card.style.opacity = '';
        card.style.transform = '';
        card.style.zIndex = '';
        card.style.cursor = 'grab';
        card.style.background = '';
        card.style.borderRadius = '';
        
        // Re-enable click events on clickable elements
        const clickableElements = card.querySelectorAll('button, .card-favorite, .card-edit, .card-container, .subtasks-dropdown-btn');
        clickableElements.forEach(element => {
            element.style.pointerEvents = '';
        });
    });
    
    draggedTaskCard = null;
}

function swapTaskCards(card1, card2) {
    console.log('Swapping task cards');
    
    // Get the parent container
    const container = document.querySelector('.content-task');
    
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
    
    console.log('Task swap completed successfully');
    
    // Update order attributes and save to backend
    updateTaskCardOrders();
    saveTaskCardOrder();
    
    showTaskNotification('ลำดับภาระงานได้รับการบันทึกแล้ว', 'success');
}

function updateTaskCardOrders() {
    const cards = document.querySelectorAll('.card-wrapper[draggable="true"]');
    cards.forEach((card, index) => {
        card.dataset.order = index;
    });
}

async function saveTaskCardOrder() {
    try {
        const cards = document.querySelectorAll('.card-wrapper[draggable="true"]');
        const orderData = [];
        
        cards.forEach((card, index) => {
            // Extract task ID from various possible sources
            const taskId = card.querySelector('.card-edit')?.getAttribute('data-task-id') || 
                          card.querySelector('.card-favorite')?.onclick?.toString().match(/toggleFavorite\(event, (\d+)/)?.[1];
            
            if (taskId) {
                orderData.push({
                    id: parseInt(taskId),
                    order: index
                });
            }
        });
        
        console.log('Saving new task order:', orderData);
        
        if (orderData.length === 0) {
            console.warn('No task IDs found for reordering');
            return;
        }
        
        const response = await fetch('/tasks/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ orders: orderData })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to save task order');
        }
        
        console.log('Task order saved successfully');
        
    } catch (error) {
        console.error('Error saving task order:', error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกลำดับภาระงาน';
        
        if (error.message.includes('order') || error.message.includes('column')) {
            errorMessage = 'ต้องเพิ่มคอลัมน์ order ในฐานข้อมูลก่อน - กรุณาเรียกใช้ migration';
            showTaskNotification(errorMessage, 'warning');
            console.warn('❌ DATABASE SETUP REQUIRED ❌');
            console.warn('Please run: php artisan migrate');
            return;
        } else if (error.message.includes('Route') || error.message.includes('404')) {
            console.warn('Reorder endpoint not available - this is expected during development');
            showTaskNotification('การเรียงลำดับได้ถูกบันทึกชั่วคราว (รอการอัพเดท API)', 'info');
            return;
        }
        
        showTaskNotification(errorMessage, 'error');
        
        // Only reload page for other types of errors
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

function addTaskDragAndDropStyles() {
    const existingStyle = document.getElementById('task-drag-drop-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'task-drag-drop-styles';
    style.textContent = `
        .card-wrapper[draggable="true"] {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            position: relative;
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
        
        /* Ensure drag doesn't interfere with card content */
        .card-wrapper.dragging .card-container,
        .card-wrapper.dragging button,
        .card-wrapper.dragging .card-favorite,
        .card-wrapper.dragging .card-edit,
        .card-wrapper.dragging .subtasks-dropdown-btn {
            pointer-events: none !important;
        }
        
        /* Add visual feedback for users who can reorder */
        .card-wrapper[draggable="true"]::before {            
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
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
    console.log('Task drag and drop styles added');
}

function showTaskNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.task-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `task-notification ${type}`;
    notification.textContent = message;
    
    // Style the notification - matching department and member implementations
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
    if (!document.getElementById('taskNotificationStyles')) {
        const notificationStyle = document.createElement('style');
        notificationStyle.id = 'taskNotificationStyles';
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

function addTaskClickPreservation(card) {
    let isDragging = false;
    let dragStartTime = 0;
    
    // Track when potential drag starts
    card.addEventListener('mousedown', function(e) {
        // Don't interfere with button clicks
        if (e.target.closest('.card-favorite, .card-edit, .subtasks-dropdown-btn')) return;
        
        isDragging = false;
        dragStartTime = Date.now();
    });
    
    // Track if user is dragging
    card.addEventListener('dragstart', function(e) {
        isDragging = true;
    });
    
    // Preserve existing click functionality but prevent it during drag
    const originalOnClick = card.onclick;
    if (originalOnClick) {
        card.onclick = function(e) {
            // Don't execute original click if we were dragging
            if (isDragging) return;
            
            // Don't execute if this was a long press (potential drag attempt)
            const timeDiff = Date.now() - dragStartTime;
            if (timeDiff > 200) return;
            
            // Execute original click
            originalOnClick.call(this, e);
        };
    }
}

// Initialize task drag and drop when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Individual page DOM loaded, initializing task drag and drop');
    // Add a small delay to ensure all elements are rendered
    setTimeout(() => {
        initializeTaskDragAndDrop();
    }, 100);
});

// Make functions available globally
window.initializeTaskDragAndDrop = initializeTaskDragAndDrop;