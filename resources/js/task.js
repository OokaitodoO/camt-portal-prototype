// Global variables for task management
let currentSortOrder = 'asc';
let selectedDepartmentId = null;
let subtaskCount = 1;

// Function to handle department filtering
async function filterTasksByDepartment(departmentId) {
    try {
        const allDepartmentTables = document.querySelectorAll('.task-department');
        
        // Show all tables if 'all' is selected
        if (departmentId === 'all') {
            allDepartmentTables.forEach(table => {
                table.style.display = 'block';
            });
        } else {
            // Hide all tables first
            allDepartmentTables.forEach(table => {
                table.style.display = 'none';
            });
            
            // Show only the selected department's table
            const selectedTable = document.querySelector(`.task-department[data-department-id="${departmentId}"]`);
            if (selectedTable) {
                selectedTable.style.display = 'block';
            }
        }

        // Update active state of side navigation buttons
        document.querySelectorAll('.btn-side-nav').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (departmentId !== 'all') {
            const activeBtn = document.querySelector(`.btn-side-nav[onclick="filterTasksByDepartment(${departmentId})"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }

        // Update task count
        const visibleTasks = document.querySelectorAll('.task-department:not([style*="display: none"]) .table-task').length;
        const taskCountElement = document.querySelector('.task-remain p');
        if (taskCountElement) {
            taskCountElement.textContent = visibleTasks;
        }

    } catch (error) {
        console.error('Error filtering tasks:', error);
        alert('เกิดข้อผิดพลาดในการกรองข้อมูล');
    }
}

// Function to update member dropdown based on selected department
async function updateMemberDropdown(departmentId) {
    try {
        const response = await axios.get(`/departments/${departmentId}/members`);
        const memberSelect = document.querySelector('select[name="assigned_to"]');
        
        memberSelect.innerHTML = '<option value="">เลือกบุคลากร</option>';
        
        response.data.members.forEach(member => {
            memberSelect.innerHTML += `
                <option value="${member.id}">
                    ${member.first_name} ${member.last_name}
                </option>
            `;
        });
        
        memberSelect.disabled = false;
    } catch (error) {
        console.error('Error updating members:', error);
    }
}

// Function to handle task logo upload
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.popup-image img').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Function to delete subtask in create mode
function deleteSubTask(element) {
    const subtaskContainer = document.getElementById('createSubTasksContainer');
    if (subtaskContainer) {
        const subtaskItem = element.closest('.popup-sub-task');
        if (subtaskItem) {
            subtaskItem.remove();
        }
    }
}

// Function to delete subtask in edit mode
function deleteEditSubTask(element) {
    const subtaskContainer = document.getElementById('editSubTasksContainer');
    if (subtaskContainer) {
        const subtaskItem = element.closest('.popup-sub-task');
        if (subtaskItem) {
            subtaskItem.remove();
        }
    }
}

// Function to add new subtask
function addNewSubTask(mode = 'create') {
    const containerId = mode === 'edit' ? 'editSubTasksContainer' : 'createSubTasksContainer';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    const subtaskCount = container.children.length + 1;
    const newSubtask = document.createElement('div');
    newSubtask.className = 'popup-sub-task';
    newSubtask.innerHTML = `
        <div class="popup-sub-task-detail">
            <div class="input-group">
                <label class="sarabun-16">ภาระงานย่อย ${subtaskCount}</label>
                <input type="text" 
                       name="sub_tasks[${subtaskCount-1}][title]" 
                       class="input-text sarabun-16" 
                       placeholder="text...">
            </div>
            <div class="input-group">
                <label class="sarabun-16">ลิ้งก์</label>
                <input type="text" 
                       name="sub_tasks[${subtaskCount-1}][link]" 
                       class="input-text sarabun-16" 
                       placeholder="text...">
            </div>
        </div>
        <div class="popup-sub-task-delete">
            <button type="button" class="remove-subtask" onclick="removeSubTask(this)">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    
    container.appendChild(newSubtask);
}

// Function to load departments into dropdown
async function loadDepartments(dropdownId) {
    try {
        const response = await axios.get('/departments');
        const departments = response.data;
        const dropdownContent = document.getElementById(dropdownId);
        
        if (dropdownContent) {
            dropdownContent.innerHTML = departments.map(dept => `
                <a href="#" onclick="selectDepartment(this, ${dept.id}, '${dept.name}', '${dropdownId}')" 
                   data-department-id="${dept.id}">${dept.name}</a>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Function to toggle dropdown visibility
function toggleDropdownDepartment(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        // Load departments if not already loaded
        if (!dropdown.children.length) {
            loadDepartments(dropdownId);
        }
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// Function to select department
function selectDepartment(element, departmentId, departmentName, dropdownId) {
    event.preventDefault();
    
    const isEdit = dropdownId.includes('Edit');
    const spanId = isEdit ? 'editTaskDepartment' : 'createTaskDepartment';
    
    // Update the dropdown button text
    const dropdownBtn = document.getElementById(spanId);
    if (dropdownBtn) {
        dropdownBtn.textContent = departmentName;
        dropdownBtn.setAttribute('data-department-id', departmentId);
    }
    
    // Load members for selected department
    loadDepartmentMembers(departmentId, isEdit ? 'dropdownMenuMemberEdit' : 'dropdownMenuMemberCreate');
    
    // Hide dropdown
    document.getElementById(dropdownId).style.display = 'none';
}

// Function to load members for selected department
async function loadDepartmentMembers(departmentId, dropdownId) {
    try {
        const response = await axios.get(`/tasks/department/${departmentId}/members`);
        const members = response.data.members;
        const dropdownContent = document.getElementById(dropdownId);
        
        if (dropdownContent) {
            dropdownContent.innerHTML = members.map(member => `
                <a href="#" onclick="selectMember(this, ${member.id}, '${member.first_name} ${member.last_name}', '${dropdownId}')" 
                   data-member-id="${member.id}">${member.first_name} ${member.last_name}</a>
            `).join('');
            
            // Enable member dropdown
            const memberDropdown = dropdownContent.closest('.dropdown');
            if (memberDropdown) {
                memberDropdown.style.pointerEvents = 'auto';
                memberDropdown.style.opacity = '1';
            }
        }
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

// Function to toggle member dropdown
function toggleDropdownMember(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// Function to select member
function selectMember(element, memberId, memberName, dropdownId) {
    event.preventDefault();
    
    const isEdit = dropdownId.includes('Edit');
    const spanId = isEdit ? 'editTaskAssignedTo' : 'createTaskAssignedTo';
    
    // Update the dropdown button text
    const dropdownBtn = document.getElementById(spanId);
    if (dropdownBtn) {
        dropdownBtn.textContent = memberName;
        dropdownBtn.setAttribute('data-member-id', memberId);
    }
    
    // Hide dropdown
    document.getElementById(dropdownId).style.display = 'none';
}

// Function to create new task
async function createNewTask() {
    try {
        const form = document.getElementById('createTaskForm');
        if (!form) {
            console.error('Create task form not found');
            return;
        }

        const formData = new FormData(form);
        
        // Log form data for debugging
        console.log('Form data before submission:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        // Get selected member IDs
        const selectedMembers = Array.from(
            document.querySelectorAll('#createSelectedMembers .selected-member-tag input[type="hidden"]')
        ).map(input => input.value);

        if (selectedMembers.length === 0) {
            alert('กรุณาเลือกบุคลากรอย่างน้อย 1 คน');
            return;
        }

        // Add selected members as comma-separated string
        formData.set('assigned_to', selectedMembers.join(','));

        // Validate required fields
        const title = formData.get('title');
        if (!title) {
            alert('กรุณากรอกชื่อภาระงาน');
            return;
        }

        // Handle subtasks
        const subtasks = Array.from(document.querySelectorAll('#createSubTasksContainer .popup-sub-task'))
            .map(subtask => ({
                title: subtask.querySelector('input[name*="[title]"]')?.value?.trim() || '',
                link: subtask.querySelector('input[name*="[link]"]')?.value?.trim() || ''
            }))
            .filter(subtask => subtask.title !== '');

        formData.set('sub_tasks', JSON.stringify(subtasks));

        // Send request
        const response = await axios.post('/tasks', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            closeCreatePopup();
            location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to create task');
        }

    } catch (error) {
        console.error('Error creating task:', error);
        console.error('Error details:', error.response?.data);
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างภาระงาน');
    }
}

// Function to open create popup
function openCreatePopup() {
    // Reset form
    const form = document.getElementById('createTaskForm');
    if (form) {
        form.reset();
    }

    // Reset department and member selections
    const departmentSpan = document.querySelector('#createTaskDepartment');
    const memberSpan = document.querySelector('#createTaskAssignedTo');
    
    if (departmentSpan) {
        departmentSpan.textContent = 'เลือกหน่วยงาน';
        departmentSpan.setAttribute('data-department-id', '');
    }
    
    if (memberSpan) {
        memberSpan.textContent = 'เลือกบุคลากร';
        memberSpan.setAttribute('data-member-id', '');
    }

    // Reset logo preview
    const logoPreview = document.getElementById('createTaskLogoPreview');
    if (logoPreview) {
        logoPreview.src = 'https://placehold.co/128';
    }

    // Clear subtasks
    const subTasksContainer = document.querySelector('.popup-sub-task-wrapper');
    if (subTasksContainer) {
        subTasksContainer.innerHTML = '';
    }

    // Show popup using active class
    document.getElementById('popupCreate').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

// Function to close create popup
function closeCreatePopup() {
    document.getElementById('popupCreate').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Function to reset create form
function resetCreateForm() {
    // Reset form
    const form = document.getElementById('createTaskForm');
    if (form) {
        form.reset();
    }

    // Reset department and member selections
    const departmentSpan = document.querySelector('#createTaskDepartment');
    const memberSpan = document.querySelector('#createTaskAssignedTo');
    
    if (departmentSpan) {
        departmentSpan.textContent = 'เลือกหน่วยงาน';
        departmentSpan.setAttribute('data-department-id', '');
    }
    
    if (memberSpan) {
        memberSpan.textContent = 'เลือกบุคลากร';
        memberSpan.setAttribute('data-member-id', '');
    }

    // Reset logo preview
    const logoPreview = document.getElementById('createTaskLogoPreview');
    if (logoPreview) {
        logoPreview.src = 'https://placehold.co/128';
    }

    // Clear subtasks
    const subTasksContainer = document.querySelector('.popup-sub-task-wrapper');
    if (subTasksContainer) {
        subTasksContainer.innerHTML = '';
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadDepartments();
    resetCreateForm();  // Reset form on page load
    
    // Disable member dropdown initially
    const memberDropdown = document.querySelector('#dropdownMenuMemberCreate')?.closest('.dropdown');
    if (memberDropdown) {
        memberDropdown.style.pointerEvents = 'none';
        memberDropdown.style.opacity = '0.5';
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
    
    // Logo upload
    const logoInput = document.querySelector('input[type="file"]');
    if (logoInput) {
        logoInput.addEventListener('change', handleLogoUpload);
    }
    initializeMemberSearch();
    initializeDatePicker();
});

// Make functions available globally
window.createNewTask = createNewTask;
window.resetCreateForm = resetCreateForm;
window.addNewSubTask = addNewSubTask;
window.deleteSubTask = deleteSubTask;
window.deleteEditSubTask = deleteEditSubTask;
window.selectDepartment = selectDepartment;
window.selectMember = selectMember;
window.toggleDropdownDepartment = toggleDropdownDepartment;
window.toggleDropdownMember = toggleDropdownMember;
window.loadDepartmentMembers = loadDepartmentMembers;
window.filterTasksByDepartment = filterTasksByDepartment;
window.openCreatePopup = openCreatePopup;
window.closeCreatePopup = closeCreatePopup;

async function openEditPopup(element) {
    try {
        console.log('Opening edit popup');
        const taskId = element.getAttribute('data-task-id');
        console.log('Task ID:', taskId);

        // Get task data
        const response = await axios.get(`/tasks/${taskId}/data`);
        console.log('Task data:', response.data);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch task data');
        }

        const task = response.data.task;

        // Get form elements
        const form = document.getElementById('editTaskForm');
        const editTaskId = document.getElementById('editTaskId');
        const editTaskTitle = document.getElementById('editTaskTitle');
        const editTaskDescription = document.getElementById('editTaskDescription');
        const editTaskLink = document.getElementById('editTaskLink');
        const editTaskDeadline = document.getElementById('editTaskDeadline');
        const editTaskLogoPreview = document.getElementById('editTaskLogoPreview');
        const editTaskAssignedTo = document.getElementById('editTaskAssignedTo');

        // Set form values
        editTaskId.value = taskId;
        editTaskTitle.value = task.title || '';
        editTaskDescription.value = task.description || '';
        editTaskLink.value = task.link || '';

        // Format and set deadline if exists
        if (task.deadline) {
            const deadlineDate = new Date(task.deadline);
            const day = String(deadlineDate.getDate()).padStart(2, '0');
            const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
            const year = deadlineDate.getFullYear();
            editTaskDeadline.value = `${day}/${month}/${year}`;
        } else {
            editTaskDeadline.value = '';
        }

        // Set assigned to
        if (task.assigned_to) {
            editTaskAssignedTo.value = `${task.assigned_to.first_name} ${task.assigned_to.last_name}`;
            editTaskAssignedTo.setAttribute('data-member-id', task.assigned_to.id);
        }

        // Set logo preview
        if (task.logo_path) {
            const cleanPath = task.logo_path.replace(/^\/storage\//, '');
            editTaskLogoPreview.src = `/storage/${cleanPath}`;
        } else {
            editTaskLogoPreview.src = 'https://placehold.co/128';
        }

        // Load subtasks
        await loadSubTasks(taskId, 'edit');

        // Show popup
        const popup = document.getElementById('popupEdit');
        const overlay = document.getElementById('overlay');
        if (popup && overlay) {
            popup.classList.add('active');
            overlay.classList.add('active');
        }

    } catch (error) {
        console.error('Error in openEditPopup:', error);
        alert('เกิดข้อผิดพลาดในการเปิดหน้าต่างแก้ไข');
    }
}

// Function to close edit popup
function closeEditPopup() {
    document.getElementById('popupEdit').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Make only the necessary functions globally available
window.openEditPopup = openEditPopup;
window.closeEditPopup = closeEditPopup;

async function openDeleteConfirmationPopup() {
    try {
        const taskId = document.getElementById('editTaskId').value;
        const response = await axios.get(`/tasks/${taskId}/edit`);
        const task = response.data.task;

        // Set the task details in the delete confirmation popup
        document.getElementById('deleteTaskLogo').src = task.logo_path || 'https://placehold.co/128';
        document.getElementById('deleteTaskTitle').textContent = task.title;
        document.getElementById('deleteTaskDescription').textContent = task.description || '-';
        document.getElementById('deleteTaskAssignedTo').textContent = 
            task.assigned_to ? `${task.assigned_to.first_name} ${task.assigned_to.last_name}` : '-';
        document.getElementById('deleteTaskDeadline').textContent = 
            task.deadline ? new Date(task.deadline).toLocaleDateString('th-TH') : '-';

        // Show subtasks if any
        const deleteSubTasksContainer = document.getElementById('deleteSubTasksContainer');
        if (task.sub_tasks && task.sub_tasks.length > 0) {
            let subtasksHtml = '<div class="card-info-item"><h2 class="sarabun-16">ภาระงานย่อย:</h2><ul>';
            task.sub_tasks.forEach(subTask => {
                subtasksHtml += `<li class="sarabun-16">${subTask.title}</li>`;
            });
            subtasksHtml += '</ul></div>';
            deleteSubTasksContainer.innerHTML = subtasksHtml;
        } else {
            deleteSubTasksContainer.innerHTML = '';
        }

        // Show the delete confirmation popup
        document.getElementById('deleteConfirmationPopup').classList.add('active');
        document.getElementById('overlay').classList.add('active');
        
        // Hide the edit popup
        document.getElementById('popupEdit').classList.remove('active');
    } catch (error) {
        console.error('Error loading task details for deletion:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลภาระงาน');
    }
}

function closeDeleteConfirmation() {
    document.getElementById('deleteConfirmationPopup').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('popupEdit').classList.add('active');
}

async function deleteTask() {
    try {
        const taskId = document.getElementById('editTaskId').value;
        await axios.delete(`/tasks/${taskId}`);
        
        // Close all popups and refresh the page
        document.getElementById('deleteConfirmationPopup').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        window.location.reload();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('เกิดข้อผิดพลาดในการลบภาระงาน');
    }
}

// Make functions globally available
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup;
window.closeDeleteConfirmation = closeDeleteConfirmation;
window.deleteTask = deleteTask;

async function updateTask() {
    try {
        const form = document.getElementById('editTaskForm');
        const taskId = document.getElementById('editTaskId').value;
        
        // Create FormData object
        const formData = new FormData(form);
        
        // Get assigned_to from the readonly input
        const assignedToInput = document.getElementById('editTaskAssignedTo');
        const assignedToId = assignedToInput.getAttribute('data-member-id');
        
        if (!assignedToId) {
            throw new Error('ไม่พบข้อมูลผู้รับผิดชอบ');
        }
        
        // Add method override for PUT request
        formData.append('_method', 'PUT');
        formData.append('assigned_to', assignedToId);

        // Handle deadline - if empty, remove it from FormData
        const deadline = document.getElementById('editTaskDeadline').value;
        if (!deadline) {
            formData.delete('deadline');
        }

        // Handle subtasks
        const subtasks = Array.from(document.querySelectorAll('#editSubTasksContainer .popup-sub-task'))
            .map(subtask => ({
                title: subtask.querySelector('input[name*="[title]"]')?.value?.trim() || '',
                link: subtask.querySelector('input[name*="[link]"]')?.value?.trim() || ''
            }))
            .filter(subtask => subtask.title !== '');

        formData.append('sub_tasks', JSON.stringify(subtasks));

        // Log the FormData contents for debugging
        console.log('Form data being sent:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await axios.post(`/tasks/${taskId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            }
        });

        console.log('Server response:', response.data);

        if (response.data.success) {
            closeEditPopup();
            location.reload();
        } else {
            throw new Error(response.data.message || 'Update failed');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        console.error('Full error details:', error.response?.data);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการอัปเดตภาระงาน: ';
        if (error.response?.data?.message) {
            errorMessage += error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage += error.response.data.error;
        } else if (error.message) {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

// Make function globally available
window.updateTask = updateTask;

function toggleSubtasks(event, taskId) {
    event.preventDefault();
    event.stopPropagation();
    
    const subtasksContent = document.getElementById(`subtasks-${taskId}`);
    const button = event.currentTarget;
    const arrow = button.querySelector('.dropdown-arrow');
    
    if (subtasksContent.style.display === 'none') {
        subtasksContent.style.display = 'block';
        arrow.classList.add('active');
    } else {
        subtasksContent.style.display = 'none';
        arrow.classList.remove('active');
    }
}

// Make the function globally available
window.toggleSubtasks = toggleSubtasks;

async function toggleFavorite(event, taskId, element) {
    try {
        event.stopPropagation();
        const isFavorite = element.getAttribute('data-favorite') === 'true';
        
        // Update the favorite status
        const response = await axios.post(`/tasks/${taskId}/toggle-favorite`, {
            is_favorite: !isFavorite
        });
        
        if (response.data.success) {
            // Update the UI
            const starIcon = element.querySelector('i');
            element.setAttribute('data-favorite', (!isFavorite).toString());
            
            if (!isFavorite) {
                starIcon.classList.add('favorite-active');
            } else {
                starIcon.classList.remove('favorite-active');
            }
            
            // Refresh the page to update the favorites sidebar
            window.location.reload();
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('เกิดข้อผิดพลาดในการเพิ่ม/ลบรายการโปรด');
    }
}

// Make the function globally available
window.toggleFavorite = toggleFavorite;

function openTaskLink(event, link) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!link) {
        console.log('No link provided');
        return;
    }
    
    // Check if the link starts with http:// or https://
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'https://' + link;
    }
    
    window.open(link, '_blank');
}

// Make the function globally available
window.openTaskLink = openTaskLink;

// Add these new functions for member search
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

function setupMemberSearch(input, selectedContainer, mode) {
    let dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'member-search-dropdown';
    input.parentNode.appendChild(dropdownContainer);

    let selectedMembers = new Set();

    input.addEventListener('input', debounce(async (e) => {
        const query = e.target.value;

        if (query.length < 2) {
            dropdownContainer.innerHTML = '';
            return;
        }

        try {
            // Remove department filter from the search
            const response = await axios.get('/tasks/search-members', {
                params: { query }
            });

            if (response.data.success) {
                if (response.data.members.length === 0) {
                    dropdownContainer.innerHTML = '<div class="member-search-item">ไม่พบบุคลากร</div>';
                    return;
                }

                dropdownContainer.innerHTML = response.data.members
                    .filter(member => !selectedMembers.has(member.id))
                    .map(member => `
                        <div class="member-search-item" onclick="selectSearchedMember(${member.id}, '${member.first_name} ${member.last_name}', '${mode}')">
                            ${member.first_name} ${member.last_name}
                            <span class="member-department">${member.department_name || ''}</span>
                        </div>
                    `).join('');
            }
        } catch (error) {
            console.error('Error searching members:', error);
            dropdownContainer.innerHTML = '<div class="member-search-item">เกิดข้อผิดพลาดในการค้นหา</div>';
        }
    }, 300));

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdownContainer.contains(e.target)) {
            dropdownContainer.innerHTML = '';
        }
    });

    // Track selected members
    selectedMembers = new Set();
    const updateSelectedMembers = () => {
        const selectedTags = selectedContainer.querySelectorAll('.selected-member-tag input[type="hidden"]');
        selectedMembers.clear();
        selectedTags.forEach(input => selectedMembers.add(parseInt(input.value)));
    };

    // Initialize selected members
    updateSelectedMembers();

    // Use MutationObserver instead of DOMNodeRemoved
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                updateSelectedMembers();
            }
        });
    });

    // Configure and start the observer
    observer.observe(selectedContainer, {
        childList: true,
        subtree: true
    });

    // Clean up observer when needed (e.g., when the component is destroyed)
    window.addEventListener('unload', () => {
        observer.disconnect();
    });
}

function selectSearchedMember(memberId, memberName, mode) {
    const container = document.querySelector(`#${mode}SelectedMembers`);
    const input = document.querySelector(`#${mode}TaskMemberSearch`);
    
    const memberTag = document.createElement('div');
    memberTag.className = 'selected-member-tag';
    memberTag.innerHTML = `
        ${memberName}
        <input type="hidden" name="assigned_to[]" value="${memberId}">
        <span class="remove-member" onclick="removeSearchedMember(this)">&times;</span>
    `;
    
    container.appendChild(memberTag);
    input.value = '';
    document.querySelector('.member-search-dropdown').innerHTML = '';
}

function removeSearchedMember(element) {
    element.closest('.selected-member-tag').remove();
}

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available
window.selectSearchedMember = selectSearchedMember;
window.removeSearchedMember = removeSearchedMember;

function sortByDeadline() {
    // Get all visible department tables
    const visibleTables = document.querySelectorAll('.task-department:not([style*="display: none"]) .department-task-body');
    
    // Toggle sort order
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    
    // Update sort icon
    const sortIcon = document.querySelector('th i.fas');
    if (sortIcon) {
        sortIcon.className = currentSortOrder === 'asc' 
            ? 'fas fa-sort-up' 
            : 'fas fa-sort-down';
    }
    
    visibleTables.forEach(tableBody => {
        const rows = Array.from(tableBody.getElementsByTagName('tr'));
        
        rows.sort((a, b) => {
            const dateA = a.cells[3].textContent.trim();
            const dateB = b.cells[3].textContent.trim();
            
            // Handle cases where there's no deadline
            if (dateA === 'ไม่มีวันครบกำหนด') return currentSortOrder === 'asc' ? 1 : -1;
            if (dateB === 'ไม่มีวันครบกำหนด') return currentSortOrder === 'asc' ? -1 : 1;
            
            // Convert Thai date format (dd/mm/yyyy) to Date objects
            const [dayA, monthA, yearA] = dateA.split('/');
            const [dayB, monthB, yearB] = dateB.split('/');
            
            const dateObjA = new Date(yearA, monthA - 1, dayA);
            const dateObjB = new Date(yearB, monthB - 1, dayB);
            
            return currentSortOrder === 'asc' 
                ? dateObjA - dateObjB 
                : dateObjB - dateObjA;
        });
        
        rows.forEach(row => tableBody.appendChild(row));
    });
}

// Make sure sortByDeadline is available globally
window.sortByDeadline = sortByDeadline;

// Make sure axios is configured globally with the CSRF token
axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
axios.defaults.withCredentials = true;

async function loadSubTasks(taskId, mode) {
    try {
        const response = await axios.get(`/tasks/${taskId}/subtasks`);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        const container = document.getElementById(`${mode}SubTasksContainer`);
        if (!container) return;

        container.innerHTML = '';
        response.data.subtasks.forEach((subtask, index) => {
            container.innerHTML += `
                <div class="popup-sub-task">
                    <div class="popup-sub-task-detail">
                        <div class="input-group">
                            <label class="sarabun-16">ภาระงานย่อย ${index + 1}</label>
                            <input type="text" 
                                   name="sub_tasks[${index}][title]" 
                                   value="${subtask.title}" 
                                   class="input-text sarabun-16" 
                                   placeholder="text...">
                        </div>
                        <div class="input-group">
                            <label class="sarabun-16">ลิ้งก์</label>
                            <input type="text" 
                                   name="sub_tasks[${index}][link]" 
                                   value="${subtask.link || ''}" 
                                   class="input-text sarabun-16" 
                                   placeholder="text...">
                        </div>
                    </div>
                    <div class="popup-sub-task-delete">
                        <button type="button" class="remove-subtask" onclick="removeSubTask(this)">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading subtasks:', error);
    }
}

// Function to remove subtask
function removeSubTask(element) {
    const subtaskItem = element.closest('.popup-sub-task');
    if (subtaskItem) {
        subtaskItem.remove();
    }
}

// Make functions available globally
window.removeSubTask = removeSubTask;
window.addNewSubTask = addNewSubTask;

// Function to initialize date picker
function initializeDatePicker() {
    // Initialize for both create and edit forms
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    if (typeof flatpickr === 'undefined') {
        console.error('Flatpickr is not loaded');
        return;
    }
    
    dateInputs.forEach(input => {
        // Set the input type to "text" to prevent browser's default date picker
        input.type = 'text';
        
        // Set placeholder
        input.placeholder = 'dd/mm/yyyy';
        
        // Initialize Flatpickr with Thai locale
        flatpickr(input, {
            dateFormat: "d/m/Y",
            allowInput: true,
            locale: "th",
            altFormat: "d/m/Y",
            altInput: false,
            disableMobile: true,
            onChange: function(selectedDates, dateStr, instance) {
                // Optional: Add any onChange handling here
                console.log('Selected date:', dateStr);
            }
        });
    });
}

// Call this function when the document is ready and after Flatpickr is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof flatpickr !== 'undefined') {
        initializeDatePicker();
    } else {
        console.error('Flatpickr library not found');
    }
});

// Make function globally available
window.initializeDatePicker = initializeDatePicker; 