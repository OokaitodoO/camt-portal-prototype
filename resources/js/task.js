// Global variables for task management
let currentSortOrder = 'asc';
let selectedDepartmentId = null;
let subtaskCount = 1;

// Function to handle department filtering
async function filterTasksByDepartment(departmentId) {
    try {
        const response = await axios.get(`/tasks/filter/${departmentId}`);
        if (response.data.success) {
            updateTaskTable(response.data.tasks);
            selectedDepartmentId = departmentId;
            
            // Update department dropdown in create form
            const departmentSelect = document.querySelector('select[name="department_id"]');
            if (departmentSelect) {
                departmentSelect.value = departmentId;
                updateMemberDropdown(departmentId);
            }
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
function addNewSubTask() {
    subtaskCount++;
    const subtaskHtml = `
        <div class="popup-sub-task">
            <div class="popup-sub-task-detail">
                <div class="popup-input-wrapper">
                    <h2 class="sarabun-16">ภาระงานย่อย ${subtaskCount}</h2>
                    <input type="text" name="subtasks[]" placeholder="ภาระงาน..." class="input-text sarabun-16">
                </div>
                <div class="popup-input-wrapper">
                    <h2 class="sarabun-16">ลิ้งก์</h2>
                    <input type="text" name="subtask_links[]" placeholder="ลิ้งก์..." class="input-text sarabun-16">
                </div>
            </div>
            <div class="popup-sub-task-delete btn-pointer" onclick="deleteSubTask(this)">
                <i class="fas fa-trash-can"></i>
            </div>
        </div>
    `;
    
    document.querySelector('.popup-sub-task-wrapper').insertAdjacentHTML('beforeend', subtaskHtml);
}

// Function to delete subtask
function deleteSubTask(element) {
    element.closest('.popup-sub-task').remove();
}

// Function to sort tasks by deadline
function sortByDeadline() {
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    const tbody = document.getElementById('taskTableBody');
    const rows = Array.from(tbody.getElementsByTagName('tr'));
    
    rows.sort((a, b) => {
        const dateA = new Date(a.cells[4].textContent.split('/').reverse().join('-'));
        const dateB = new Date(b.cells[4].textContent.split('/').reverse().join('-'));
        return currentSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
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
    element.closest('.dropdown-content').style.display = 'none';
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
    element.closest('.dropdown-content').style.display = 'none';
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
        const form = document.getElementById('createTaskForm');
        
        // Get form values
        const title = form.querySelector('input[name="title"]').value;
        const description = form.querySelector('input[name="description"]').value;
        const departmentId = form.querySelector('.dropdown-btn .selected-text[data-department-id]').getAttribute('data-department-id');
        const memberId = form.querySelector('.dropdown-btn .selected-text[data-member-id]').getAttribute('data-member-id');
        const deadline = form.querySelector('input[name="deadline"]').value;
        const link = form.querySelector('input[name="link"]').value;

        // Validate required fields
        if (!title || !departmentId || !memberId || !deadline) {
            throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description || '');
        formData.append('department_id', departmentId);
        formData.append('assigned_to', memberId);
        formData.append('deadline', deadline);
        formData.append('link', link || '');

        // Add logo if selected
        const logoInput = form.querySelector('input[name="logo"]');
        if (logoInput?.files[0]) {
            formData.append('logo', logoInput.files[0]);
        }

        // Add subtasks
        const subtasks = form.querySelectorAll('.popup-sub-task');
        subtasks.forEach((subtask, index) => {
            const title = subtask.querySelector('input[placeholder="ภาระงาน..."]').value;
            const link = subtask.querySelector('input[placeholder="ลิ้งก์..."]').value;
            
            if (title.trim()) {
                formData.append(`subtasks[${index}]`, title);
                formData.append(`subtask_links[${index}]`, link || '');
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
            // Add new task to table
            const task = response.data.task;
            const newRow = `
                <tr class="table-task">
                    <td class="border-top sarabun-16">${task.title}</td>
                    <td class="border-top sarabun-16">${task.department.name}</td>
                    <td class="border-top sarabun-16">${task.assigned_to?.first_name || '-'}</td>
                    <td class="border-top sarabun-16">${task.assigned_by?.first_name || '-'}</td>
                    <td class="border-top sarabun-16">${new Date(task.deadline).toLocaleDateString('th-TH')}</td>
                    <td class="border-top" onclick="openEditPopup(${task.id})">
                        <i class="fas fa-gear btn-edit"></i>
                    </td>
                </tr>
            `;
            document.getElementById('taskTableBody').insertAdjacentHTML('beforeend', newRow);

            // Close popup and reset form
            closeCreatePopup();
            resetCreateForm();
        }

    } catch (error) {
        console.error('Error creating task:', error);
        alert(error.message || 'เกิดข้อผิดพลาดในการสร้างภาระงาน');
    }
}

// Function to reset create form
function resetCreateForm() {
    const form = document.querySelector('#popupCreate form');
    if (form) {
        form.reset();
        // Reset dropdowns
        document.querySelectorAll('#popupCreate .selected-text').forEach(element => {
            element.textContent = element.getAttribute('data-default-text');
            element.removeAttribute('data-department-id');
            element.removeAttribute('data-member-id');
        });
        // Reset subtasks
        const subtaskWrapper = document.querySelector('.popup-sub-task-wrapper');
        subtaskWrapper.innerHTML = `
            <div class="popup-sub-task">
                <div class="popup-sub-task-detail">
                    <div class="popup-input-wrapper">
                        <h2 class="sarabun-16">ภาระงานย่อย 1</h2>
                        <input type="text" placeholder="ภาระงาน..." class="input-text sarabun-16">
                    </div>
                    <div class="popup-input-wrapper">
                        <h2 class="sarabun-16">ลิ้งก์</h2>
                        <input type="text" placeholder="ลิ้งก์..." class="input-text sarabun-16">
                    </div>
                </div>
                <div class="popup-sub-task-delete btn-pointer" onclick="deleteSubTask(this)">
                    <i class="fas fa-trash-can"></i>
                </div>
            </div>
        `;
        subtaskCount = 1;
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadDepartments();
    
    // Disable member dropdown initially
    const memberDropdown = document.querySelector('#dropdownMenuMemberCreate').closest('.dropdown');
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