// Global variables for task management
let currentSortOrder = 'asc';
let selectedDepartmentId = null;
let subtaskCount = 1;

// Function to handle department filtering
async function filterTasksByDepartment(departmentId) {
    try {
        // Hide all department tables first
        document.querySelectorAll('.task-department').forEach(table => {
            table.style.display = 'none';
        });

        if (departmentId === 'all') {
            // Show all tables if 'all' is selected
            document.querySelectorAll('.task-department').forEach(table => {
                table.style.display = 'block';
            });
        } else {
            // Show only the selected department's table
            const departmentTables = document.querySelectorAll('.task-department');
            departmentTables.forEach(table => {
                const tableHeader = table.querySelector('h1');
                if (tableHeader && table.querySelector(`#taskTableBody-${departmentId}`)) {
                    table.style.display = 'block';
                }
            });
        }

        // Update active state of side navigation buttons
        document.querySelectorAll('.btn-side-nav').forEach(btn => {
            btn.classList.remove('active');
        });
        if (departmentId !== 'all') {
            document.querySelector(`.btn-side-nav[onclick="filterTasksByDepartment(${departmentId})"]`)
                ?.classList.add('active');
        }

        // Update task count
        const visibleTasks = document.querySelectorAll('.task-department:not([style*="display: none"]) .table-task').length;
        document.querySelector('.task-remain p').textContent = visibleTasks;

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
    if (!container) return;

    const subtaskCount = container.children.length + 1;
    const subtaskHtml = `
        <div class="popup-sub-task">
            <div class="popup-sub-task-detail">
                <div class="popup-input-wrapper">
                    <h2 class="sarabun-16">ภาระงานย่อย ${subtaskCount}</h2>
                    <input type="text" name="subtasks[]" class="input-text sarabun-16">
                </div>
                <div class="popup-input-wrapper">
                    <h2 class="sarabun-16">ลิ้งก์</h2>
                    <input type="text" name="subtask_links[]" class="input-text sarabun-16">
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
    const subtaskElement = element.closest('.popup-sub-task');
    if (subtaskElement) {
        subtaskElement.remove();
        
        // Renumber remaining subtasks
        const container = subtaskElement.closest('.popup-sub-task-wrapper');
        if (container) {
            const subtasks = container.querySelectorAll('.popup-sub-task');
            subtasks.forEach((subtask, index) => {
                const title = subtask.querySelector('h2');
                if (title) {
                    title.textContent = `ภาระงานย่อย ${index + 1}`;
                }
            });
        }
    }
}

// Function to sort tasks by deadline for a specific department
function sortByDeadline(departmentId) {
    const tbody = document.getElementById(`taskTableBody-${departmentId}`);
    const rows = Array.from(tbody.getElementsByTagName('tr'));
    
    // Get current sort order from the table
    const currentOrder = tbody.getAttribute('data-sort') || 'asc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    
    rows.sort((a, b) => {
        const dateA = new Date(a.cells[4].textContent.split('/').reverse().join('-'));
        const dateB = new Date(b.cells[4].textContent.split('/').reverse().join('-'));
        
        return newOrder === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
    });
    
    // Update the sort order
    tbody.setAttribute('data-sort', newOrder);
    
    // Update sort icon
    const sortIcon = tbody.closest('table').querySelector('th i.fas');
    sortIcon.className = newOrder === 'asc' 
        ? 'fas fa-sort-up' 
        : 'fas fa-sort-down';
    
    // Reappend sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Function to load departments into dropdown
async function loadDepartments() {
    try {
        const response = await axios.get('/departments');
        const departments = response.data;
        const dropdownContent = document.getElementById('dropdownMenuDepartmentCreate');
        
        if (dropdownContent) {
            dropdownContent.innerHTML = departments.map(dept => `
                <a href="#" onclick="selectDepartment(this, ${dept.id}, '${dept.name}')" 
                   data-department-id="${dept.id}">${dept.name}</a>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Function to select department
function selectDepartment(element, departmentId, departmentName) {
    // Prevent default link behavior
    event.preventDefault();
    
    // Update the dropdown button text
    const dropdownBtn = element.closest('.dropdown').querySelector('.dropdown-btn .selected-text');
    if (dropdownBtn) {
        dropdownBtn.textContent = departmentName;
        dropdownBtn.setAttribute('data-department-id', departmentId);
    }
    
    // Load members for selected department
    loadDepartmentMembers(departmentId);
    
    // Toggle dropdown visibility
    const dropdownContent = element.closest('.dropdown-content');
    if (dropdownContent) {
        dropdownContent.style.display = 'none';
    }
}

// Function to toggle dropdown visibility
function toggleDropdownDepartment(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// Function to load members for selected department
async function loadDepartmentMembers(departmentId) {
    try {
        const response = await axios.get(`/tasks/department/${departmentId}/members`);
        const members = response.data.members;
        const dropdownContent = document.getElementById('dropdownMenuMemberCreate');
        
        if (dropdownContent) {
            dropdownContent.innerHTML = members.map(member => `
                <a href="#" onclick="selectMember(this, ${member.id}, '${member.first_name} ${member.last_name}')" 
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

// Function to select member
function selectMember(element, memberId, memberName) {
    // Prevent default link behavior
    event.preventDefault();
    
    // Update the dropdown button text
    const dropdownBtn = element.closest('.dropdown').querySelector('.dropdown-btn .selected-text');
    if (dropdownBtn) {
        dropdownBtn.textContent = memberName;
        dropdownBtn.setAttribute('data-member-id', memberId);
    }
    
    // Toggle dropdown visibility
    const dropdownContent = element.closest('.dropdown-content');
    if (dropdownContent) {
        dropdownContent.style.display = 'none';
    }
}

// Function to toggle member dropdown
function toggleDropdownMember(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// Function to create new task
async function createNewTask() {
    try {
        // Get form data
        const form = document.getElementById('createTaskForm');
        if (!form) {
            console.error('Create task form not found');
            return;
        }

        const formData = new FormData(form);

        // Get department and member IDs from spans
        const departmentSpan = document.querySelector('#createTaskDepartment');
        const memberSpan = document.querySelector('#createTaskAssignedTo');

        if (!departmentSpan || !memberSpan) {
            console.error('Department or member span not found');
            alert('เกิดข้อผิดพลาด: ไม่พบข้อมูลแผนกหรือบุคลากร');
            return;
        }

        // Add department and member IDs to form data
        formData.append('department_id', departmentSpan.getAttribute('data-department-id'));
        formData.append('assigned_to', memberSpan.getAttribute('data-member-id'));

        // Get subtasks
        const subtasks = document.querySelectorAll('#createSubTasksContainer .popup-sub-task');
        subtasks.forEach((subtask, index) => {
            const titleInput = subtask.querySelector('input[name="subtasks[]"]');
            const linkInput = subtask.querySelector('input[name="subtask_links[]"]');
            
            if (titleInput && titleInput.value.trim()) {
                formData.append(`sub_tasks[${index}][title]`, titleInput.value.trim());
                if (linkInput && linkInput.value.trim()) {
                    formData.append(`sub_tasks[${index}][link]`, linkInput.value.trim());
                }
            }
        });

        // Send request
        const response = await axios.post('/tasks', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            // Close popup and refresh page
            closeCreatePopup();
            location.reload();
        } else {
            alert('เกิดข้อผิดพลาดในการสร้างภาระงาน');
        }

    } catch (error) {
        console.error('Error creating task:', error);
        if (error.response) {
            console.error('Server error:', error.response.data);
        }
        alert('เกิดข้อผิดพลาดในการสร้างภาระงาน');
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
        const taskId = element.getAttribute('data-task-id');
        
        // Show overlay and popup using active class
        document.getElementById('overlay').classList.add('active');
        document.getElementById('popupEdit').classList.add('active');
        
        // Fetch task details
        const response = await axios.get(`/tasks/${taskId}/edit`);
        const task = response.data.task;

        // Populate form fields
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description || '';
        document.getElementById('editTaskLink').value = task.link || '';
        document.getElementById('editTaskDeadline').value = task.deadline;
        
        // Set department
        const departmentSpan = document.querySelector('#editTaskDepartment');
        departmentSpan.textContent = task.department.name;
        departmentSpan.setAttribute('data-department-id', task.department_id);

        // Set assigned member
        const memberSpan = document.querySelector('#editTaskAssignedTo');
        if (task.assigned_to) {
            memberSpan.textContent = `${task.assigned_to.first_name} ${task.assigned_to.last_name}`;
            memberSpan.setAttribute('data-member-id', task.assigned_to.id);
        } else {
            memberSpan.textContent = 'เลือกบุคลากร';
            memberSpan.setAttribute('data-member-id', '');
        }

        // Set logo
        const logoPreview = document.getElementById('editTaskLogoPreview');
        logoPreview.src = task.logo_path || 'https://placehold.co/128';

        // Handle subtasks
        const subTasksContainer = document.getElementById('editSubTasksContainer');
        subTasksContainer.innerHTML = ''; // Clear existing subtasks

        if (task.sub_tasks && task.sub_tasks.length > 0) {
            task.sub_tasks.forEach((subTask, index) => {
                const subTaskHtml = `
                    <div class="popup-sub-task" data-subtask-id="${subTask.id}">
                        <div class="popup-sub-task-detail">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ภาระงานย่อย ${index + 1}</h2>
                                <input type="text" name="sub_tasks[${index}][title]" 
                                       value="${subTask.title}" 
                                       class="input-text sarabun-16">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ลิ้งก์</h2>
                                <input type="text" name="sub_tasks[${index}][link]" 
                                       value="${subTask.link || ''}" 
                                       class="input-text sarabun-16">
                            </div>
                        </div>
                        <div class="popup-sub-task-delete btn-pointer" onclick="deleteSubTask(this)">
                            <i class="fas fa-trash-can"></i>
                        </div>
                    </div>
                `;
                subTasksContainer.insertAdjacentHTML('beforeend', subTaskHtml);
            });
        }

    } catch (error) {
        console.error('Error fetching task details:', error);
        if (error.response) {
            console.error('Server error:', error.response.data);
        }
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลภาระงาน');
        
        // Hide overlay and popup if there's an error
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('popupEdit').classList.remove('active');
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

function openDeleteConfirmationPopup() {
    // Get task details from edit form
    const taskId = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const department = document.querySelector('#editTaskDepartment').textContent;
    const assignedTo = document.querySelector('#editTaskAssignedTo').textContent;
    const deadline = document.getElementById('editTaskDeadline').value;
    const logo = document.getElementById('editTaskLogoPreview').src;

    // Populate delete confirmation popup
    document.getElementById('deleteTaskLogo').src = logo;
    document.getElementById('deleteTaskTitle').textContent = title;
    document.getElementById('deleteTaskDescription').textContent = description || '-';
    document.getElementById('deleteTaskDepartment').textContent = department;
    document.getElementById('deleteTaskAssignedTo').textContent = assignedTo;
    document.getElementById('deleteTaskDeadline').textContent = deadline;

    // Handle subtasks in delete confirmation
    const subTasksContainer = document.getElementById('deleteSubTasksContainer');
    subTasksContainer.innerHTML = '';
    
    const editSubTasks = document.querySelectorAll('#editSubTasksContainer .popup-sub-task');
    if (editSubTasks.length > 0) {
        const subTasksList = document.createElement('div');
        subTasksList.innerHTML = '<h2 class="sarabun-16">ภาระงานย่อย:</h2>';
        editSubTasks.forEach((subTask, index) => {
            const title = subTask.querySelector('input[name*="[title]"]').value;
            subTasksList.innerHTML += `<p class="sarabun-16">${index + 1}. ${title}</p>`;
        });
        subTasksContainer.appendChild(subTasksList);
    }

    // Show delete confirmation popup using active class
    closeEditPopup();
    document.getElementById('deleteConfirmationPopup').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

// Make functions globally available
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup;

// Function to delete task
async function deleteTask() {
    try {
        const taskId = document.getElementById('editTaskId').value;
        
        if (!taskId) {
            console.error('No task ID found');
            alert('เกิดข้อผิดพลาด: ไม่พบรหัสภาระงาน');
            return;
        }

        // Get CSRF token
        const token = document.querySelector('meta[name="csrf-token"]').content;
        if (!token) {
            console.error('CSRF token not found');
            alert('เกิดข้อผิดพลาด: ไม่พบ CSRF token');
            return;
        }

        // Send delete request
        const response = await axios.delete(`/tasks/${taskId}`, {
            headers: {
                'X-CSRF-TOKEN': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            // Close the delete confirmation popup
            closeDeleteConfirmation();
            
            // Refresh the page to show updated task list
            location.reload();
        } else {
            console.error('Server returned success: false', response.data);
            alert('เกิดข้อผิดพลาดในการลบภาระงาน');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        if (error.response) {
            console.error('Server error details:', error.response.data);
        }
        alert('เกิดข้อผิดพลาดในการลบภาระงาน');
    }
}

// Function to close delete confirmation popup
function closeDeleteConfirmation() {
    document.getElementById('deleteConfirmationPopup').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Make functions globally available
window.deleteTask = deleteTask;
window.closeDeleteConfirmation = closeDeleteConfirmation;
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup; 