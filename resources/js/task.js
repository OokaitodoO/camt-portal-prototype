// Global variables for task management
let currentSortOrder = 'asc';
let selectedDepartmentId = null;
let subtaskCount = 1;

// Function to handle department filtering
async function filterTasksByDepartment(departmentId) {
    try {
        const userRole = document.querySelector('meta[name="user-role"]')?.content;
        const userDepartmentId = document.querySelector('meta[name="user-department-id"]')?.content;
        const allDepartmentTables = document.querySelectorAll('.task-department');
        
        // For headstaff, only allow viewing their own department
        // if (userRole === 'headstaff' && departmentId !== 'all' && departmentId != userDepartmentId) {
        //     console.warn('Access restricted: Can only view own department');
        //     return;
        // }

        // Show all tables if 'all' is selected
        if (departmentId === 'all') {
            allDepartmentTables.forEach(table => {
                table.style.display = 'grid';
            });
        } else {
            // Hide all tables first
            allDepartmentTables.forEach(table => {
                table.style.display = 'none';
            });
            
            // Show only the selected department's table
            const selectedTable = document.querySelector(`.task-department[data-department-id="${departmentId}"]`);
            if (selectedTable) {
                selectedTable.style.display = 'grid';
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
        updateTaskCount();
        // location.reload();

    } catch (error) {
        console.error('Error filtering tasks:', error);
        alert('เกิดข้อผิดพลาดในการกรองข้อมูล');
    }
}

// Add this helper function to update task count
function updateTaskCount() {
    const visibleTasks = document.querySelectorAll('.task-department:not([style*="display: none"]) .table-task').length;
    const taskCountElement = document.querySelector('.task-remain p');
    if (taskCountElement) {
        taskCountElement.textContent = visibleTasks;
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
async function loadDepartments() {
    try {
        const response = await axios.get('/departments');
        if (response.data.success) {
            return response.data.departments;
        } else {
            console.error('Failed to load departments:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        return []; // Return empty array on error
    }
}

// Function to toggle dropdown visibility
function toggleDropdownDepartment(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        // Load departments if not already loaded
        if (!dropdown.children.length) {
            loadDepartments();
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
        const formData = new FormData(form);

        // Collect validation errors
        const errors = [];
        let firstErrorField = null;

        // Validate required fields
        const titleInput = form.querySelector('input[name="title"]');
        const linkInput = form.querySelector('input[name="link"]');  
        const deadlineInput = form.querySelector('input[name="deadline"]');
        
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

        // Get selected members and validate
        const selectedMembers = document.querySelectorAll('#createSelectedMembers .selected-member-tag input[type="hidden"]');
        console.log('Selected members:', selectedMembers.length); // Debug log
        
        const memberIds = Array.from(selectedMembers).map(input => {
            const memberId = input.value;
            console.log('Member ID:', memberId); // Debug log
            return memberId;
        }).filter(id => id);
        
        if (memberIds.length === 0) {
            errors.push('กรุณาเลือกผู้รับผิดชอบอย่างน้อย 1 คน');
            if (!firstErrorField) {
                firstErrorField = document.querySelector('#createTaskMemberSearch');
            }
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

        // Handle deadline format conversion
        if (deadlineInput.value) {
            // Convert from dd/mm/yyyy to yyyy-mm-dd
            const [day, month, year] = deadlineInput.value.split('/');
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            formData.set('deadline', formattedDate);
        } else {
            formData.delete('deadline');
        }

        formData.set('assigned_to', memberIds.join(','));

        // Handle subtasks - Fixed container ID
        const subTasks = [];
        document.querySelectorAll('#createSubTasksContainer .popup-sub-task').forEach((item, index) => {
            const title = item.querySelector('input[name^="sub_tasks"][name$="[title]"]').value;
            const link = item.querySelector('input[name^="sub_tasks"][name$="[link]"]').value;
            if (title.trim()) {
                subTasks.push({ title, link });
            }
        });
        formData.append('sub_tasks', JSON.stringify(subTasks));

        const response = await axios.post('/tasks', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            location.reload();
        }
    } catch (error) {
        console.error('Error creating task:', error);
        console.error('Error details:', error.response?.data);
        alert('เกิดข้อผิดพลาดในการสร้างภาระงาน: ' + (error.response?.data?.message || error.message));
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
    document.body.classList.add('lock-scroll');
}

// Function to close create popup
function closeCreatePopup() {
    document.getElementById('popupCreate').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.classList.remove('lock-scroll');
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
    // loadDepartments();
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

    const userRole = document.querySelector('meta[name="user-role"]')?.content;
    const userDepartmentId = document.querySelector('meta[name="user-department-id"]')?.content;

    // if (userRole === 'headstaff') {
    //     // Hide departments in side nav that aren't the user's department
    //     document.querySelectorAll('.btn-side-nav').forEach(btn => {
    //         const onclick = btn.getAttribute('onclick');
    //         if (onclick && onclick.includes('filterTasksByDepartment')) {
    //             const deptId = onclick.match(/filterTasksByDepartment\((\d+)\)/)?.[1];
    //             if (deptId && deptId != userDepartmentId && deptId !== 'all') {
    //                 btn.style.display = 'none';
    //             }
    //         }
    //     });

    //     // Initially filter to show only user's department
    //     filterTasksByDepartment(userDepartmentId);
    // }
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
            // Convert to Thai date format for display
            const deadlineDate = new Date(task.deadline);
            const day = String(deadlineDate.getDate()).padStart(2, '0');
            const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
            const year = deadlineDate.getFullYear();
            
            // For flatpickr input
            editTaskDeadline.value = `${day}/${month}/${year}`;
            
            // Initialize flatpickr with the date
            if (editTaskDeadline._flatpickr) {
                editTaskDeadline._flatpickr.setDate(`${day}/${month}/${year}`);
            }
        } else {
            editTaskDeadline.value = '';
            if (editTaskDeadline._flatpickr) {
                editTaskDeadline._flatpickr.clear();
            }
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

        // Add event listener for logo upload in edit popup
        const editLogoInput = document.getElementById('editTaskLogo');
        if (editLogoInput) {
            editLogoInput.addEventListener('change', handleEditLogoUpload);
        }

        // Show popup
        const popup = document.getElementById('popupEdit');
        const overlay = document.getElementById('overlay');
        popup.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('lock-scroll');

    } catch (error) {
        console.error('Error opening edit popup:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลภาระงาน');
    }
}

// Function to close edit popup
function closeEditPopup() {
    document.getElementById('popupEdit').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.classList.remove('lock-scroll');
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
        document.body.classList.add('lock-scroll');
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
    document.body.classList.remove('lock-scroll');    
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

// Function to update task
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

        // Check assigned member (readonly but should have value)
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

        // Handle the date input properly
        if (deadlineInput && deadlineInput.value) {
            // Convert from dd/mm/yyyy to yyyy-mm-dd
            const [day, month, year] = deadlineInput.value.split('/');
            if (day && month && year) {
                const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                formData.set('deadline', formattedDate);
            }
        } else {
            formData.delete('deadline');
        }

        // Handle subtasks
        const subTasks = [];
        document.querySelectorAll('#editSubTasksContainer .popup-sub-task').forEach((item, index) => {
            const title = item.querySelector('input[name^="sub_tasks"]').value;
            const link = item.querySelector('input[name^="sub_tasks"][name$="[link]"]').value;
            if (title.trim()) {
                subTasks.push({ title, link });
            }
        });
        formData.append('sub_tasks', JSON.stringify(subTasks));

        const response = await axios.post(`/tasks/${taskId}/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            window.location.reload();
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.error('Error updating task:', error);
        console.log('Full error details:', error.response?.data);
        alert('เกิดข้อผิดพลาดในการอัปเดตภาระงาน: ' + (error.response?.data?.message || error.message));
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
        const isFavorite = element.getAttribute('data-favorite') === '1';
        
        // Update the favorite status
        const response = await axios.post(`/tasks/${taskId}/toggle-favorite`, {
            is_favorite: !isFavorite
        });
        
        if (response.data.success) {
            // Update the UI
            const starIcon = element.querySelector('i');
            element.setAttribute('data-favorite', !isFavorite ? '1' : '0');
            
            if (!isFavorite) {
                starIcon.classList.add('favorite-active');
            } else {
                starIcon.classList.remove('favorite-active');
            }
            
            // Update the favorites sidebar if the function exists (for individual page)
            if (typeof window.updateFavoriteTasksSidebar === 'function') {
                window.updateFavoriteTasksSidebar();
            } else {
                // Fallback to reload if not on individual page
                window.location.reload();
            }
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
    // Remove any existing dropdowns first
    const existingDropdowns = input.parentNode.querySelectorAll('.member-search-dropdown');
    existingDropdowns.forEach(dropdown => dropdown.remove());

    // Create new dropdown
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

window.setupMemberSearch = setupMemberSearch;

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
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    if (typeof flatpickr === 'undefined') {
        console.error('Flatpickr is not loaded');
        return;
    }
    
    dateInputs.forEach(input => {
        input.type = 'text';
        input.placeholder = 'dd/mm/yyyy';
        
        flatpickr(input, {
            dateFormat: "d/m/Y",
            allowInput: true,
            locale: "th",
            altFormat: "Y-m-d",  // Backend format
            altInput: false,     // We'll handle the format conversion ourselves
            disableMobile: true,
            onChange: function(selectedDates, dateStr, instance) {
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

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Close the dropdown if clicked outside
window.onclick = function(event) {
    if (!event.target.matches('.btn-status') && !event.target.matches('.btn-status *')) {
        const dropdowns = document.getElementsByClassName('dropdown-menu');
        for (let dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
}

window.toggleUserDropdown = toggleUserDropdown;
// Make function globally available
window.initializeDatePicker = initializeDatePicker;

// Function to handle logo preview for edit popup
function handleEditLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('editTaskLogoPreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Make the function globally available
window.handleEditLogoUpload = handleEditLogoUpload;

// Add search functionality for tasks
function searchTasks(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const taskDepartments = document.querySelectorAll('.task-department');
    let totalVisibleTasks = 0;

    taskDepartments.forEach(department => {
        const taskRows = department.querySelectorAll('.table-task');
        let hasVisibleTasks = false;

        taskRows.forEach(row => {
            const taskTitle = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
            const assignedTo = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const assignedBy = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            
            if (searchTerm === '' || 
                taskTitle.includes(searchTerm) || 
                assignedTo.includes(searchTerm) || 
                assignedBy.includes(searchTerm)) {
                row.style.display = '';
                hasVisibleTasks = true;
                totalVisibleTasks++;
            } else {
                row.style.display = 'none';
            }
        });

        // Show/hide department section based on visible tasks
        if (!hasVisibleTasks && searchTerm !== '') {
            department.style.display = 'none';
        } else {
            department.style.display = '';
        }

        // Show/hide department title
        const departmentTitle = department.querySelector('.page-title');
        if (departmentTitle) {
            if (!hasVisibleTasks && searchTerm !== '') {
                departmentTitle.style.opacity = '0';
                setTimeout(() => {
                    departmentTitle.style.display = 'none';
                }, 300);
            } else {
                departmentTitle.style.display = '';
                departmentTitle.style.opacity = '1';
            }
            departmentTitle.style.transition = 'opacity 0.3s ease-in-out';
        }
    });

    // Update task count
    const taskCountElement = document.querySelector('.task-remain p');
    if (taskCountElement) {
        taskCountElement.textContent = totalVisibleTasks;
    }

    // Update side navigation visibility
    const sideNavItems = document.querySelectorAll('.side-nav .btn-side-nav');
    sideNavItems.forEach(item => {
        const departmentId = item.getAttribute('onclick')?.match(/\d+/)?.[0];
        if (!departmentId) return; // Skip if no department ID (e.g., "all" button)

        const hasTasks = document.querySelector(`.task-department[data-department-id="${departmentId}"] .table-task:not([style*="display: none"])`);
        if (!hasTasks && searchTerm !== '') {
            item.style.opacity = '0';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        } else {
            item.style.display = '';
            item.style.opacity = '1';
        }
        item.style.transition = 'opacity 0.3s ease-in-out';
    });
}

// Add event listener when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchTasks(e);
            }, 300);
        });
    }
});

// Make the function globally available
window.searchTasks = searchTasks; 