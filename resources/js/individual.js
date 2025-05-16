// Function to initialize date picker
function initializeDatePicker() {
    const dateInputs = document.querySelectorAll('.date-picker input[type="text"]');
    
    dateInputs.forEach(input => {
        flatpickr(input, {
            dateFormat: "d/m/Y",
            allowInput: true,
            locale: "th",
            disableMobile: true
        });
    });
}

// Function to handle logo upload preview
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('taskLogoPreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
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
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างภาระงาน');
    }
}

// Function to open create popup
function openCreatePopup() {
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

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Logo upload
    const logoInput = document.getElementById('taskLogo');
    if (logoInput) {
        logoInput.addEventListener('change', handleLogoUpload);
    }
    
    initializeDatePicker();
});

// Make functions globally available
window.openCreatePopup = openCreatePopup;
window.closeCreatePopup = closeCreatePopup;
window.createNewTask = createNewTask;
window.addNewSubTask = addNewSubTask;
window.removeSubTask = removeSubTask;

function toggleFavorite(event, taskId, element) {
    event.stopPropagation();
    
    const isFavorite = element.getAttribute('data-favorite') === '1';
    
    axios.post(`/tasks/${taskId}/toggle-favorite`, {
        _token: document.querySelector('meta[name="csrf-token"]').content
    })
    .then(response => {
        if (response.data.success) {
            // Toggle the favorite status
            element.setAttribute('data-favorite', isFavorite ? '0' : '1');
            element.querySelector('i').classList.toggle('favorite-active');
            
            // Refresh the page to show the updated order
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error toggling favorite:', error);
    });
}

window.toggleFavorite = toggleFavorite;

// Member search functionality
let searchTimeout;
const memberSearchInput = document.getElementById('createTaskMemberSearch');
const memberSearchDropdown = document.querySelector('.member-search-dropdown');
const selectedMembersContainer = document.getElementById('createSelectedMembers');

memberSearchInput.addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.trim();

    if (searchTerm.length >= 2) {
        searchTimeout = setTimeout(() => {
            searchMembers(searchTerm);
        }, 300);
    } else {
        memberSearchDropdown.innerHTML = '';
        memberSearchDropdown.style.display = 'none';
    }
});

function searchMembers(searchTerm) {
    const departmentId = document.querySelector('meta[name="user-department-id"]').content;
    
    axios.get('/tasks/search-members', {
        params: {
            search: searchTerm,
            department_id: departmentId
        }
    })
    .then(response => {
        memberSearchDropdown.innerHTML = '';
        const members = response.data.members;
        
        if (members.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'member-search-item no-results';
            noResults.textContent = 'ไม่พบข้อมูล';
            memberSearchDropdown.appendChild(noResults);
        } else {
            members.forEach(member => {
                // Check if member is already selected
                if (!document.querySelector(`.selected-member-tag[data-member-id="${member.id}"]`)) {
                    const memberElement = document.createElement('div');
                    memberElement.className = 'member-search-item';
                    memberElement.innerHTML = `
                        <div class="member-info">
                            <span class="member-name">${member.first_name} ${member.last_name}</span>
                            <span class="member-position">${member.position || ''}</span>
                        </div>
                    `;
                    memberElement.onclick = () => selectMember(member);
                    memberSearchDropdown.appendChild(memberElement);
                }
            });
        }
        
        memberSearchDropdown.style.display = 'block';
    })
    .catch(error => {
        console.error('Error searching members:', error);
        memberSearchDropdown.innerHTML = '<div class="member-search-item error">เกิดข้อผิดพลาดในการค้นหา</div>';
        memberSearchDropdown.style.display = 'block';
    });
}

function selectMember(member) {
    if (!document.querySelector(`.selected-member-tag[data-member-id="${member.id}"]`)) {
        const memberTag = document.createElement('div');
        memberTag.className = 'selected-member-tag';
        memberTag.setAttribute('data-member-id', member.id);
        memberTag.innerHTML = `
            <span>${member.first_name} ${member.last_name}</span>
            <i class="fas fa-times" onclick="removeMemberTag(this)"></i>
            <input type="hidden" name="assigned_to[]" value="${member.id}">
        `;
        selectedMembersContainer.appendChild(memberTag);
    }
    
    memberSearchInput.value = '';
    memberSearchDropdown.style.display = 'none';
}

function removeMemberTag(element) {
    const tag = element.parentElement;
    if (selectedMembersContainer.children.length > 1) {
        tag.remove();
    } else {
        alert('ต้องมีผู้รับผิดชอบอย่างน้อย 1 คน');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.member-search-container')) {
        memberSearchDropdown.style.display = 'none';
    }
});

// Make functions globally available
window.removeMemberTag = removeMemberTag; 