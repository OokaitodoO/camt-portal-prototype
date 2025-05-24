// Global variables and functions
let currentCard = null;

// Edit popup functionality
async function openEditPopup(element) {
    const memberId = element.getAttribute('data-member-id');
    try {
        const response = await axios.get(`/members/${memberId}/data`);
        const member = response.data.member;

        const form = document.getElementById('editMemberForm');
        form.querySelector('#editMemberId').value = member.id;
        form.querySelector('input[name="first_name"]').value = member.first_name;
        form.querySelector('input[name="last_name"]').value = member.last_name;
        form.querySelector('input[name="position"]').value = member.position;
        form.querySelector('select[name="department_id"]').value = member.department_id;
        form.querySelector('input[name="sub_department"]').value = member.sub_department || '';
        form.querySelector('select[name="role"]').value = member.role;
        form.querySelector('input[name="email"]').value = member.email || '';
        form.querySelector('input[name="phone"]').value = member.phone || '';
        
        // Update profile picture preview
        const previewImage = document.getElementById('editPreviewImage');
        previewImage.src = member.profile_picture || 'https://placehold.co/128';

        // Format phone number when populating edit form
        const phoneInput = form.querySelector('input[name="phone"]');
        if (phoneInput && member.phone) {
            phoneInput.value = member.phone;
            formatPhoneNumber(phoneInput);
        }

        // Show popup
        document.getElementById('popupEdit').classList.add('active');
        document.getElementById('overlay').classList.add('active');        
        document.body.classList.add('lock-scroll');

    } catch (error) {
        console.error('Error loading member data:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// Popup functions
function openCreatePopup() {
    document.getElementById('createMemberForm').reset();
    document.getElementById('createPopup').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.body.classList.add('lock-scroll');
}

function closeCreatePopup() {
    document.getElementById('createPopup').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('createMemberForm').reset();
    document.getElementById('previewImage').src = 'https://placehold.co/128';
    document.body.classList.remove('lock-scroll');
}

function closeEditPopup() {
    document.getElementById('popupEdit').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.classList.remove('lock-scroll');
}

function closeDeleteConfirmation() {
    document.getElementById('deleteConfirmationPopup').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.classList.remove('lock-scroll');
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
        if ((userRole === 'staff') && 
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

// Function to handle file input change and preview
function handleProfilePictureChange(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) {
        console.error('Required elements not found:', { inputId, previewId });
        return;
    }
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Initialize file input handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    handleProfilePictureChange('memberProfilePicture', 'previewImage');
    handleProfilePictureChange('editMemberProfilePicture', 'editPreviewImage');

    // Setup phone number inputs
    const phoneInputs = document.querySelectorAll('input[name="phone"]');
    phoneInputs.forEach(input => {
        input.classList.add('phone-input');
        input.setAttribute('placeholder', 'XXX-XXX-XXXX');
        input.setAttribute('maxlength', '12'); // Account for hyphens
        input.setAttribute('pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}');
        
        input.addEventListener('input', function(e) {
            formatPhoneNumber(this);
        });

        input.addEventListener('keypress', function(e) {
            // Allow only numbers
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Format existing number if any
        if (input.value) {
            formatPhoneNumber(input);
        }
    });
});

// Utility function to log with persistence
function debugLog(message, data = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        data
    };
    
    // Store in localStorage
    let logs = JSON.parse(localStorage.getItem('debugLogs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('debugLogs', JSON.stringify(logs));
    
    // Also log to console
    console.log(message, data);
}

// Function to show stored logs
function showDebugLogs() {
    // Check for logs in both localStorage and sessionStorage
    const currentLogs = JSON.parse(localStorage.getItem('debugLogs') || '[]');
    const previousLogs = JSON.parse(sessionStorage.getItem('previousLogs') || '[]');
    const allLogs = [...previousLogs, ...currentLogs];
    
    console.log('=== Stored Debug Logs ===');
    allLogs.forEach(log => {
        console.log(`[${log.timestamp}] ${log.message}`, log.data);
    });
}

window.showDebugLogs = showDebugLogs;

// Member management functions
async function createMember(event) {
    debugLog('Create member function called');
    try {
        if (event) {
            event.preventDefault();
            debugLog('Default form submission prevented');
        }
        
        const form = document.getElementById('createMemberForm');
        debugLog('Form found:', form ? 'yes' : 'no');

        if (!form) {
            throw new Error('Create form not found');
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const cancelBtn = form.querySelector('button[type="button"]');
        
        // Disable buttons and show loading state
        if (submitBtn) submitBtn.disabled = true;
        if (cancelBtn) cancelBtn.disabled = true;
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังสร้าง...';

        const formData = new FormData(form);
        debugLog('Form data created');

        // Clean phone number before sending
        const phoneNumber = formData.get('phone');
        if (phoneNumber) {
            formData.set('phone', phoneNumber.replace(/-/g, ''));
        }

        // Log form data
        const formDataObj = {};
        for (let [key, value] of formData.entries()) {
            formDataObj[key] = value instanceof File ? 'File' : value;
        }
        debugLog('Form data contents:', formDataObj);

        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        debugLog('CSRF token found:', token ? 'yes' : 'no');

        debugLog('Sending request to server...');
        const response = await axios.post('/members', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': token
            }
        });
        debugLog('Server response:', response.data);

        if (response.data.success) {
            debugLog('Member created successfully');
            // alert('เพิ่มบุคลากรสำเร็จ');
            // showDebugLogs(); // Show logs before refresh
            // await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to create member');
        }

    } catch (error) {
        debugLog('Error occurred:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });
        
        let errorMessage = 'เกิดข้อผิดพลาดในการสร้างบุคลากร';
        if (error.response?.status === 500) {
            // Handle 500 error specifically for email validation
            if (error.response?.data?.message?.includes('email')) {
                errorMessage = 'กรุณากรอกอีเมล';
            }
        } else if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            const errorMessages = [];
            
            // Map field names to Thai messages
            const errorMessageMap = {
                'first_name': 'กรุณากรอกชื่อ',
                'last_name': 'กรุณากรอกนามสกุล',
                'position': 'กรุณากรอกตำแหน่ง',
                'department_id': 'กรุณาเลือกหน่วยงาน',
                'role': 'กรุณาเลือกบทบาท',
                'email': {
                    'required': 'กรุณากรอกอีเมล',
                    'email': 'กรุณากรอกอีเมลให้ถูกต้อง'
                }
            };

            // Convert each error to Thai message
            Object.keys(errors).forEach(field => {
                if (errorMessageMap[field]) {
                    if (typeof errorMessageMap[field] === 'object') {
                        // Handle email specific messages
                        const errorType = errors[field][0].includes('valid email') ? 'email' : 'required';
                        errorMessages.push(errorMessageMap[field][errorType]);
                    } else {
                        errorMessages.push(errorMessageMap[field]);
                    }
                } else {
                    // For any other errors, use the original message
                    errorMessages.push(errors[field][0]);
                }
            });

            errorMessage = errorMessages.join('\n');
        } else if (error.response?.data?.message) {
            // Check if the error message is about email
            if (error.response.data.message.includes('email')) {
                errorMessage = 'กรุณากรอกอีเมล';
            } else {
                errorMessage = error.response.data.message;
            }
        }
        
        alert(errorMessage);
        showDebugLogs(); // Show logs on error
    } finally {
        const form = document.getElementById('createMemberForm');
        const submitBtn = form?.querySelector('button[type="submit"]');
        const cancelBtn = form?.querySelector('button[type="button"]');
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'ตกลง';
        }
        if (cancelBtn) {
            cancelBtn.disabled = false;
        }
    }
}

window.createMember = createMember;

async function updateMember(event) {
    debugLog('Update member function started');
    try {
        if (event) {
            event.preventDefault();
            debugLog('Default form submission prevented');
        }

        const form = document.getElementById('editMemberForm');
        debugLog('Edit form found:', form ? 'yes' : 'no');

        if (!form) {
            throw new Error('Edit form not found');
        }

        const memberId = form.querySelector('#editMemberId').value;
        debugLog('Member ID:', memberId);

        const formData = new FormData(form);
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        debugLog('CSRF token found:', token ? 'yes' : 'no');

        // Disable submit button and show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const cancelBtn = form.querySelector('button[type="button"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...';
        }
        if (cancelBtn) cancelBtn.disabled = true;

        debugLog('Sending update request...');
        const response = await axios.post(`/members/${memberId}/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': token
            }
        });
        debugLog('Server response:', response.data);

        if (response.data.success) {
            debugLog('Update successful');
            // alert('อัปเดตข้อมูลสำเร็จ');
            
            // Show logs and wait before refresh
            // showDebugLogs();
            // await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Store logs in sessionStorage before refresh
            const logs = JSON.parse(localStorage.getItem('debugLogs') || '[]');
            sessionStorage.setItem('previousLogs', JSON.stringify(logs));
            
            window.location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to update member');
        }

    } catch (error) {
        debugLog('Error occurred:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });
        
        let errorMessage = 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล';
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            const errorMessages = [];
            
            // Map field names to Thai messages
            const errorMessageMap = {
                'first_name': 'กรุณากรอกชื่อ',
                'last_name': 'กรุณากรอกนามสกุล',
                'position': 'กรุณากรอกตำแหน่ง',
                'department_id': 'กรุณาเลือกหน่วยงาน',
                'role': 'กรุณาเลือกบทบาท'
            };

            // Convert each error to Thai message
            Object.keys(errors).forEach(field => {
                if (errorMessageMap[field]) {
                    errorMessages.push(errorMessageMap[field]);
                } else {
                    // For any other errors, use the original message
                    errorMessages.push(errors[field][0]);
                }
            });

            errorMessage = errorMessages.join('\n');
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        
        alert(errorMessage);
        showDebugLogs();
    } finally {
        const form = document.getElementById('editMemberForm');
        const submitBtn = form?.querySelector('button[type="submit"]');
        const cancelBtn = form?.querySelector('button[type="button"]');
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'ตกลง';
        }
        if (cancelBtn) {
            cancelBtn.disabled = false;
        }
    }
}

window.updateMember = updateMember;

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
function searchMembers(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const departmentWrappers = document.querySelectorAll('.department-wrapper');
    let totalVisibleMembers = 0;

    departmentWrappers.forEach(wrapper => {
        let hasVisibleMembers = false;
        const departmentId = wrapper.dataset.departmentId;

        // Search in all cards (both headstaff and regular)
        const allCards = wrapper.querySelectorAll('.card-wrapper-headstaff, .card-wrapper');
        
        allCards.forEach(card => {
            const name = card.querySelector('.card-name')?.textContent.toLowerCase() || '';
            const position = card.querySelector('.card-description p:first-child')?.textContent.toLowerCase() || '';
            const department = card.querySelector('.card-description p:last-child')?.textContent.toLowerCase() || '';

            if (searchTerm === '' || 
                name.includes(searchTerm) || 
                position.includes(searchTerm) || 
                department.includes(searchTerm)) {
                card.style.display = '';
                hasVisibleMembers = true;
                totalVisibleMembers++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide entire department wrapper
        if (!hasVisibleMembers && searchTerm !== '') {
            wrapper.style.display = 'none';
        } else {
            wrapper.style.display = '';
        }

        // Handle divider visibility
        const divider = wrapper.querySelector('.divider-white');
        if (divider) {
            const visibleHeadstaff = wrapper.querySelector('.card-wrapper-headstaff[style="display: none;"]') === null;
            const visibleRegular = wrapper.querySelector('.card-wrapper[style="display: none;"]') === null;
            divider.style.display = (visibleHeadstaff && visibleRegular) ? '' : 'none';
        }
    });

    // Show/hide no results message
    let noResultsMsg = document.getElementById('noResultsMessage');
    if (totalVisibleMembers === 0 && searchTerm !== '') {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'no-results sarabun-24';
            noResultsMsg.textContent = 'ไม่พบบุคลากรที่ค้นหา';
            document.querySelector('.content').appendChild(noResultsMsg);
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
        let debounceTimer;
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchMembers(e.target.value);
            }, 300);
        });
    }
});

// Make the function available globally
window.searchMembers = searchMembers;

// Add this function for handling image preview
function handleImagePreview(inputElement, previewImageId) {
    if (inputElement.files && inputElement.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewImageId).src = e.target.result;
        };
        reader.readAsDataURL(inputElement.files[0]);
    }
}

// Update the event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up member listeners');

    // Add image preview handlers
    const createImageInput = document.getElementById('memberProfilePicture');
    if (createImageInput) {
        createImageInput.addEventListener('change', function() {
            handleImagePreview(this, 'previewImage');
        });
    }

    const editImageInput = document.getElementById('editMemberProfilePicture');
    if (editImageInput) {
        editImageInput.addEventListener('change', function() {
            handleImagePreview(this, 'editPreviewImage');
        });
    }

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
    const searchInput = document.querySelector('.search-bar input[type="text"]');
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

// Clear logs on page load
document.addEventListener('DOMContentLoaded', () => {
    // Clear only localStorage logs, keep sessionStorage
    localStorage.removeItem('debugLogs');
});

// Add this function to format phone numbers
function formatPhoneNumber(input) {
    // Remove all non-numeric characters
    let number = input.value.replace(/\D/g, '');
    
    // Ensure max length of 10 digits
    number = number.substring(0, 10);
    
    // Format number as XXX-XXX-XXXX
    if (number.length > 0) {
        if (number.length <= 3) {
            number = number;
        } else if (number.length <= 6) {
            number = number.slice(0, 3) + "-" + number.slice(3);
        } else {
            number = number.slice(0, 3) + "-" + number.slice(3, 6) + "-" + number.slice(6);
        }
    }
    
    input.value = number;
}
