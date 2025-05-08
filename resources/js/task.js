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

// Function to add new subtask
function addNewSubTask(mode = 'create') {
    const containerId = mode === 'edit' ? 'editSubTasksContainer' : 'createSubTasksContainer';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    const subtaskCount = container.children.length + 1;
    const subtaskHtml = `
        <div class="popup-sub-task">
            <div class="popup-sub-task-detail">
                <div class="popup-input-wrapper">
                    <h2 class="sarabun-16">ภาระงานย่อย ${subtaskCount}</h2>
                    <input type="text" name="sub_tasks[${subtaskCount-1}][title]" class="input-text sarabun-16" required>
                </div>
                <div class="popup-input-wrapper">
                    <h2 class="sarabun-16">ลิ้งก์</h2>
                    <input type="text" name="sub_tasks[${subtaskCount-1}][link]" class="input-text sarabun-16">
                </div>
            </div>
            <div class="popup-sub-task-delete btn-pointer" onclick="deleteSubTask(this)">
                <i class="fas fa-trash-can"></i>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', subtaskHtml);
}

// Function to delete subtask
function deleteSubTask(element) {
    const subtaskDiv = element.closest('.popup-sub-task');
    if (subtaskDiv) {
        subtaskDiv.remove();
        // Renumber remaining subtasks
        const container = subtaskDiv.parentElement;
        container.querySelectorAll('.popup-sub-task').forEach((subtask, index) => {
            subtask.querySelector('h2').textContent = `ภาระงานย่อย ${index + 1}`;
        });
    }
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
});

// Make functions available globally
window.createNewTask = createNewTask;
window.resetCreateForm = resetCreateForm;
window.addNewSubTask = addNewSubTask;
window.deleteSubTask = deleteSubTask;
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
        const taskId = element.dataset.taskId;
        if (!taskId) {
            throw new Error('Task ID not found');
        }

        // Get CSRF token from meta tag
        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        const response = await axios.get(`/tasks/${taskId}`, {
            headers: {
                'X-CSRF-TOKEN': token,
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            withCredentials: true  // Important for sending cookies
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to load task details');
        }

        const task = response.data.task;

        // Set task ID
        document.getElementById('editTaskId').value = task.id;

        // Set basic task information
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description || '';
        document.getElementById('editTaskLink').value = task.link || '';
        document.getElementById('editTaskDeadline').value = task.deadline ? task.deadline.split(' ')[0] : '';

        // Set assigned member (readonly)
        if (task.assigned_to) {
            document.getElementById('editTaskAssignedTo').value = `${task.assigned_to.first_name} ${task.assigned_to.last_name}`;
            document.getElementById('editTaskAssignedToId').value = task.assigned_to.id;
        }

        // Set task logo
        const logoPreview = document.getElementById('editTaskLogoPreview');
        logoPreview.src = task.logo_path || 'https://placehold.co/128';

        // Load subtasks
        const subtasksContainer = document.getElementById('editSubTasksContainer');
        subtasksContainer.innerHTML = '';
        
        if (task.sub_tasks && task.sub_tasks.length > 0) {
            task.sub_tasks.forEach((subtask, index) => {
                const subtaskHtml = `
                    <div class="popup-sub-task">
                        <div class="popup-sub-task-detail">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ภาระงานย่อย ${index + 1}</h2>
                                <input type="text" name="sub_tasks[${index}][title]" value="${subtask.title}" class="input-text sarabun-16" required>
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ลิ้งก์</h2>
                                <input type="text" name="sub_tasks[${index}][link]" value="${subtask.link || ''}" class="input-text sarabun-16">
                            </div>
                        </div>
                        <div class="popup-sub-task-delete btn-pointer" onclick="deleteSubTask(this)">
                            <i class="fas fa-trash-can"></i>
                        </div>
                    </div>
                `;
                subtasksContainer.insertAdjacentHTML('beforeend', subtaskHtml);
            });
        }

        // Show the popup
        document.getElementById('popupEdit').classList.add('active');
        document.getElementById('overlay').classList.add('active');

    } catch (error) {
        console.error('Error loading task details:', error);
        if (error.response?.status === 401) {
            alert('กรุณาเข้าสู่ระบบใหม่');
            window.location.href = '/login';
        } else {
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูลภาระงาน');
        }
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
        if (!form) {
            console.error('Edit task form not found');
            return;
        }

        const taskId = document.getElementById('editTaskId').value;
        const formData = new FormData(form);
        
        // Get description
        const description = document.querySelector('#editTaskDescription')?.value || '';
        formData.append('description', description);

        // Get the existing member ID from the hidden input
        const memberId = document.querySelector('#editTaskAssignedToId')?.value;
        formData.append('assigned_to', memberId);
        formData.append('_method', 'PUT');

        // Get deadline if exists
        const deadline = document.querySelector('#editTaskDeadline')?.value;
        if (deadline) {
            formData.append('deadline', deadline);
        }

        // Handle subtasks
        const subtasks = document.querySelectorAll('#editSubTasksContainer .popup-sub-task');
        const subTasksData = [];
        
        subtasks.forEach((subtask) => {
            const titleInput = subtask.querySelector('input[name*="[title]"]');
            const linkInput = subtask.querySelector('input[name*="[link]"]');
            const idInput = subtask.querySelector('input[name*="[id]"]');
            
            if (titleInput && titleInput.value.trim()) {
                subTasksData.push({
                    id: idInput ? idInput.value : null,
                    title: titleInput.value.trim(),
                    link: linkInput ? linkInput.value.trim() : ''
                });
            }
        });

        formData.append('sub_tasks', JSON.stringify(subTasksData));

        // Send request
        const response = await axios.post(`/tasks/${taskId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            closeEditPopup();
            location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to update task');
        }

    } catch (error) {
        console.error('Error updating task:', error);
        console.error('Error details:', error.response?.data);
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทภาระงาน');
    }
}

// Add to window object for global access
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