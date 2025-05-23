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

        // Handle the date input
        const deadlineInput = document.getElementById('editTaskDeadline');
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