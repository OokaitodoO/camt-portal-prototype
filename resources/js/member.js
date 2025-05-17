// Global variables and functions
let currentCard = null;

// Edit popup functionality
async function openEditPopup(element) {
    try {
        const memberId = element.getAttribute('data-member-id');
        if (!memberId) {
            console.error('No member ID found');
            return;
        }

        // Fetch member data
        const response = await axios.get(`/members/${memberId}/data`);
        const data = response.data;

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch member details');
        }

        const member = data.member;

        // Populate the edit form
        document.getElementById('editMemberId').value = member.id;
        document.getElementById('editPreviewImage').src = member.profile_picture 
            ? member.profile_picture  // Already contains Storage::url path
            : 'https://placehold.co/128';
        
        const form = document.getElementById('editMemberForm');
        form.querySelector('input[name="first_name"]').value = member.first_name || '';
        form.querySelector('input[name="last_name"]').value = member.last_name || '';
        form.querySelector('input[name="position"]').value = member.position || '';
        form.querySelector('select[name="department_id"]').value = member.department_id || '';
        form.querySelector('input[name="sub_department"]').value = member.sub_department || '';
        form.querySelector('select[name="role"]').value = member.role || '';
        form.querySelector('input[name="email"]').value = member.email || '';
        form.querySelector('input[name="phone"]').value = member.phone || '';

        // Show the popup
        document.getElementById('popupEdit').classList.add('active');
        document.getElementById('overlay').classList.add('active');

    } catch (error) {
        console.error('Error opening edit popup:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// Popup functions
function openCreatePopup() {
    document.getElementById('createPopup').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function closeCreatePopup() {
    document.getElementById('createPopup').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.querySelector('#createPopup form').reset();
    document.getElementById('createPreviewImage').src = 'https://placehold.co/128';
}

function closeEditPopup() {
    document.getElementById('popupEdit').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

function closeDeleteConfirmation() {
    document.getElementById('deleteConfirmationPopup').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Delete confirmation functionality
async function openDeleteConfirmationPopup(memberId) {
    try {
        if (!memberId) {
            console.error('No member ID provided');
            return;
        }

        // Fetch member data
        const response = await axios.get(`/members/${memberId}/data`);
        const data = response.data;

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch member details');
        }

        const member = data.member;
        const tasks = data.tasks;

        // Store member ID in both popups
        document.getElementById('deleteConfirmationPopup').setAttribute('data-member-id', memberId);
        document.getElementById('taskConfirmationPopup').setAttribute('data-member-id', memberId);

        // Update the confirmation popup with member details
        const popup = document.getElementById('deleteConfirmationPopup');
        popup.querySelector('.card-logo-img').src = member.profile_picture || 'https://placehold.co/128';
        popup.querySelector('.card-name h2').textContent = `${member.first_name} ${member.last_name}`;
        
        // Update all information fields
        const infoItems = popup.querySelectorAll('.popup-member-infoamation-item');
        infoItems.forEach(item => {
            const title = item.querySelector('h2').textContent.toLowerCase();
            if (title.includes('ตำแหน่ง')) {
                item.querySelector('p').textContent = member.position || '-';
            } else if (title.includes('หน่วยงาน')) {
                item.querySelector('p').textContent = member.department.name || '-';
            } else if (title.includes('หน่วยงานย่อย')) {
                item.querySelector('p').textContent = member.sub_department || '-';
            } else if (title.includes('อีเมล')) {
                item.querySelector('p').textContent = member.email || '-';
            } else if (title.includes('เบอร์โทรศัพท์')) {
                item.querySelector('p').textContent = member.phone || '-';
            }
        });

        // Show appropriate popup based on tasks
        if (tasks && tasks.length > 0) {
            // Update task confirmation popup
            const taskPopup = document.getElementById('taskConfirmationPopup');
            taskPopup.querySelector('#memberImage').src = member.profile_picture || 'https://placehold.co/128';
            taskPopup.querySelector('#memberName').textContent = `${member.first_name} ${member.last_name}`;
            
            // Show task confirmation popup
            taskPopup.classList.add('active');
            document.getElementById('overlay').classList.add('active');
        } else {
            // Show regular delete confirmation popup
            popup.classList.add('active');
            document.getElementById('overlay').classList.add('active');
        }

    } catch (error) {
        console.error('Error opening delete confirmation:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// URL update function
function updateURL(url) {
    window.history.pushState({}, '', url);
}

// Department filter function
async function filterByDepartment(departmentId) {
    try {
        const userRole = document.querySelector('meta[name="user-role"]')?.content;
        const userDepartmentId = document.querySelector('meta[name="user-department-id"]')?.content;

        // If staff or headstaff, only allow viewing their own department
        if ((userRole === 'staff' || userRole === 'headstaff') && 
            departmentId !== 'all' && 
            departmentId != userDepartmentId) {
            console.warn('Access restricted: Can only view own department');
            return;
        }

        // Navigate to the members page with the filter
        if (departmentId === 'all') {
            window.location.href = '/members';
        } else {
            window.location.href = `/members/filter/${departmentId}`;
        }
    } catch (error) {
        console.error('Error filtering by department:', error);
        alert('เกิดข้อผิดพลาดในการกรองข้อมูล');
    }
}

// Make functions available globally
window.openEditPopup = openEditPopup;
window.openCreatePopup = openCreatePopup;
window.closeCreatePopup = closeCreatePopup;
window.closeEditPopup = closeEditPopup;
window.closeDeleteConfirmation = closeDeleteConfirmation;
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup;
window.updateURL = updateURL;
window.filterByDepartment = filterByDepartment;

// // Add animations
// const style = document.createElement('style');
// style.textContent = `
//     .deleting {
//         animation: fadeOut 0.3s ease-out forwards;
//     }

//     @keyframes fadeOut {
//         from { 
//             opacity: 1;
//             transform: scale(1);
//         }
//         to { 
//             opacity: 0;
//             transform: scale(0.8);
//         }
//     }

//     .member-card {
//         animation: fadeInUp 0.5s ease-out forwards;
//         opacity: 0;
//     }

//     @keyframes fadeInUp {
//         from {
//             opacity: 0;
//             transform: translateY(20px);
//         }
//         to {
//             opacity: 1;
//             transform: translateY(0);
//         }
//     }
// `;
// document.head.appendChild(style);

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize your event listeners here
    // ... rest of your initialization code ...
});

// Image preview
function previewImage(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Member management functions
async function createMember() {
    const form = document.getElementById('createMemberForm');
    if (!form) {
        console.error('Create form not found');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const cancelBtn = form.querySelector('button[type="button"]');
    
    if (!submitBtn || !cancelBtn) {
        console.error('Buttons not found');
        return;
    }

    try {
        // Disable buttons and show loading state
        submitBtn.disabled = true;
        cancelBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังสร้าง...';

        const formData = new FormData(form);

        // Log form data for debugging
        console.log('Sending form data:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        const response = await axios.post('/members/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        console.log('Server response:', response.data);

        if (response.data.success) {
            // Show success state
            submitBtn.innerHTML = '<i class="fas fa-check"></i> สำเร็จ';
            submitBtn.style.backgroundColor = '#28a745';

            // Close popup and reset form
            setTimeout(() => {
                closeCreatePopup();
                form.reset();
                // Refresh the page or update the UI
                window.location.reload();
            }, 1000);
        } else {
            throw new Error(response.data.message || 'Failed to create member');
        }

    } catch (error) {
        console.error('Error creating member:', error);
        console.error('Error details:', error.response?.data);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการสร้างบุคลากร';
        
        if (error.response?.data?.errors) {
            // Handle validation errors
            errorMessage = Object.values(error.response.data.errors)
                .flat()
                .join('\n');
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }

        // Show error state
        submitBtn.innerHTML = '<i class="fas fa-times"></i> ผิดพลาด';
        submitBtn.style.backgroundColor = '#dc3545';

        // Reset button state after delay
        setTimeout(() => {
            submitBtn.disabled = false;
            cancelBtn.disabled = false;
            submitBtn.innerHTML = 'ตกลง';
            submitBtn.style.backgroundColor = '#F48E2E';
        }, 1500);

        alert(errorMessage);
    }
}

async function updateMember(event) {
    event.preventDefault();
    
    const form = document.getElementById('editMemberForm');
    if (!form) return;

    const memberId = document.getElementById('editMemberId').value;
    if (!memberId) {
        console.error('No member ID found');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const cancelBtn = form.querySelector('button[type="button"]');
    
    try {
        // Disable buttons and show loading state
        submitBtn.disabled = true;
        cancelBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...';

        const formData = new FormData(form);
        
        // Log form data for debugging (optional)
        console.log('Sending form data:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        const response = await axios.post(`/members/${memberId}/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            // Show success state
            submitBtn.innerHTML = '<i class="fas fa-check"></i> สำเร็จ';
            submitBtn.style.backgroundColor = '#28a745';

            // Close popup and refresh page
            setTimeout(() => {
                closeEditPopup();
                window.location.reload();
            }, 1000);
        } else {
            throw new Error(response.data.message || 'Failed to update member');
        }

    } catch (error) {
        console.error('Error updating member:', error);
        submitBtn.disabled = false;
        cancelBtn.disabled = false;
        submitBtn.innerHTML = 'ตกลง';
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
}

function showTaskConfirmationPopup(data) {
    const popup = document.getElementById('taskConfirmationPopup');
    const member = data.member;
    const tasks = data.tasks;

    // Update member info
    document.getElementById('memberImage').src = member.profile_picture || 'https://placehold.co/128';
    document.getElementById('memberName').textContent = `${member.first_name} ${member.last_name}`;

    // Update tasks list
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item">
            <h3 class="sarabun-20">${task.title}</h3>
            <p class="sarabun-16">${task.description || ''}</p>
            <p class="sarabun-16">สถานะ: ${task.status}</p>
        </div>
    `).join('');

    // Store member ID for deletion
    popup.setAttribute('data-member-id', member.id);

    // Show the popup
    popup.classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function showDeleteConfirmationPopup(member) {
    const deletePopup = document.getElementById('deleteConfirmationPopup');
    
    // Update member info
    const profileImage = deletePopup.querySelector('.card-logo-img');
    if (profileImage) {
        profileImage.src = member.profile_picture || 'https://placehold.co/128';
    }

    const nameElement = deletePopup.querySelector('.card-name h2');
    if (nameElement) {
        nameElement.textContent = `${member.first_name} ${member.last_name}`;
    }

    // Store member ID for deletion
    deletePopup.setAttribute('data-member-id', member.id);

    // Show popup
    closeEditPopup();
    deletePopup.classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

// Function to delete member and their tasks
async function deleteMember() {
    try {
        const popup = document.getElementById('deleteConfirmationPopup');
        const memberId = popup.getAttribute('data-member-id');
        
        if (!memberId) {
            throw new Error('No member ID found');
        }

        const response = await axios.delete(`/members/${memberId}`, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            window.location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to delete member');
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        alert('เกิดข้อผิดพลาดในการลบบุคลากร: ' + (error.response?.data?.message || error.message));
    }
}

async function deleteMemberWithTasks() {
    try {
        const popup = document.getElementById('taskConfirmationPopup');
        const memberId = popup.getAttribute('data-member-id');

        if (!memberId) {
            throw new Error('No member ID found');
        }

        const response = await axios.delete(`/members/${memberId}/with-tasks`, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            window.location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to delete member and tasks');
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        alert('เกิดข้อผิดพลาดในการลบบุคลากร: ' + (error.response?.data?.message || error.message));
    }
}

function closeTaskConfirmationPopup() {
    const popup = document.getElementById('taskConfirmationPopup');
    if (popup) {
        popup.classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }
}

window.closeTaskConfirmationPopup = closeTaskConfirmationPopup;
// Add to window object to make it globally available
window.deleteMember = deleteMember;
window.deleteMemberWithTasks = deleteMemberWithTasks;

// Helper functions
function addMemberCard(memberData) {
    const container = document.querySelector('.content-container');
    const newCard = document.createElement('div');
    newCard.className = 'member-card new';
    
    newCard.innerHTML = `
        <div class="card-edit">
            <span>
                <a href="#" class="icon-action" onclick="openEditPopup(this)" data-member-id="${memberData.id}">
                    <i class="fas fa-edit"></i> แก้ไข
                </a>
            </span>
        </div>
        <div class="card-content">
            <img src="${memberData.profile_picture || '/images/default-avatar.png'}" alt="Profile Picture" class="profile-picture">
            <h3>${memberData.first_name} ${memberData.last_name}</h3>
            <p>ตำแหน่ง: ${memberData.position}</p>
            <p>หน่วยงาน: ${memberData.department_name}</p>
        </div>
    `;
    
    // Insert before the create card
    const createCard = container.querySelector('.create-card');
    container.insertBefore(newCard, createCard);
}

function updateMemberCard(memberId, memberData) {
    const card = document.querySelector(`[data-member-id="${memberId}"]`).closest('.member-card');
    
    card.innerHTML = `
        <div class="card-edit">
            <span>
                <a href="#" class="icon-action" onclick="openEditPopup(this)" data-member-id="${memberData.id}">
                    <i class="fas fa-edit"></i> แก้ไข
                </a>
            </span>
        </div>
        <div class="card-content">
            <img src="${memberData.profile_picture || '/images/default-avatar.png'}" alt="Profile Picture" class="profile-picture">
            <h3>${memberData.first_name} ${memberData.last_name}</h3>
            <p>ตำแหน่ง: ${memberData.position}</p>
            <p>หน่วยงาน: ${memberData.department_name}</p>
        </div>
    `;
    
    card.classList.add('updated');
    setTimeout(() => card.classList.remove('updated'), 300);
}

// Search functionality
function searchMembers() {
    const searchInput = document.querySelector('.serach-bar input[type="text"]');
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.member-card:not(.create-card)');
    
    cards.forEach(card => {
        const memberName = card.querySelector('h3').textContent.toLowerCase();
        const position = card.querySelector('p').textContent.toLowerCase();
        const department = card.querySelectorAll('p')[1].textContent.toLowerCase();
        
        if (memberName.includes(searchTerm) || 
            position.includes(searchTerm) || 
            department.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Update the event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up member listeners');

    // Add click handlers for edit buttons
    document.querySelectorAll('.icon-action[onclick="openEditPopup(this)"]').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            openEditPopup(this);
        });
    });

    // Close popup when clicking outside
    document.querySelectorAll('.popup-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(event) {
            if (event.target === this) {
                if (this.id === 'editPopup') {
                    closeEditPopup();
                } else if (this.id === 'deletePopup') {
                    closeDeleteConfirmation();
                } else if (this.id === 'createPopup') {
                    closeCreatePopup();
                }
            }
        });
    });

    // Close buttons in popups
    document.querySelectorAll('.popup-close').forEach(button => {
        button.addEventListener('click', function() {
            const popup = this.closest('.popup-overlay');
            if (popup.id === 'editPopup') {
                closeEditPopup();
            } else if (popup.id === 'deletePopup') {
                closeDeleteConfirmation();
            } else if (popup.id === 'createPopup') {
                closeCreatePopup();
            }
        });
    });

    // Search input event listener
    const searchInput = document.querySelector('.serach-bar input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', searchMembers);
    }

    // Add animations for cards
    document.querySelectorAll('.member-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Debug: Log if script is properly loaded
    console.log('Member.js initialized');
});