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
        form.querySelector('input[name="email"]').value = member.email ? member.email.replace('@cmu.ac.th', '') : '';
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

        // Update email field and trigger CMU email handling
        const emailInput = form.querySelector('input[name="email"]');
        if (emailInput) {
            emailInput.value = member.email ? member.email.replace('@cmu.ac.th', '') : '';
            handleCMUEmail(emailInput);
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

        // Store member ID and data in the popup for later use
        const popup = document.getElementById('deleteConfirmationPopup');
        popup.setAttribute('data-member-id', memberId);
        popup.setAttribute('data-member-data', JSON.stringify(data));

        // Update the confirmation popup with member details
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

        // Close edit popup if it's open
        const editPopup = document.getElementById('popupEdit');
        if (editPopup) {
            editPopup.classList.remove('active');
        }

        // Always show the delete confirmation popup first
        popup.classList.add('active');
        document.getElementById('overlay').classList.add('active');
        document.body.classList.add('lock-scroll');

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

        // Get the email prefix and append @cmu.ac.th
        const emailPrefix = formData.get('email');
        formData.set('email', emailPrefix + '@cmu.ac.th');

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
        
        // Get the email prefix and append @cmu.ac.th
        const emailPrefix = formData.get('email');
        formData.set('email', emailPrefix + '@cmu.ac.th');

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
    tasksList.innerHTML = tasks.map(task => {
        // Debug: Log each task to see its properties
        console.log('Processing task:', task);
        
        // Handle different possible property names for title
        const taskTitle = task.title || task.name || task.task_title || task.task_name || 'ไม่มีชื่อภาระงาน';
        const taskDescription = task.description || task.desc || task.task_description || '';
        
        return `
            <div class="task-item sarabun-16">
                <strong>${taskTitle}</strong>
                ${taskDescription ? `<br><span class="task-description">${taskDescription}</span>` : ''}
            </div>
        `;
    }).join('');

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

// Function to delete member - now checks for tasks first
async function deleteMember() {
    try {
        const popup = document.getElementById('deleteConfirmationPopup');
        const memberId = popup.getAttribute('data-member-id');
        const memberDataStr = popup.getAttribute('data-member-data');
        
        if (!memberId) {
            throw new Error('No member ID found');
        }

        // Parse stored member data
        const memberData = JSON.parse(memberDataStr);
        const tasks = memberData.tasks;

        // If member has tasks, show task confirmation popup
        if (tasks && tasks.length > 0) {
            // Close delete confirmation popup
            popup.classList.remove('active');
            
            // Show task confirmation popup
            const taskPopup = document.getElementById('taskConfirmationPopup');
            taskPopup.setAttribute('data-member-id', memberId);
            
            // Update task confirmation popup with member info
            taskPopup.querySelector('#memberImage').src = memberData.member.profile_picture || 'https://placehold.co/128';
            taskPopup.querySelector('#memberName').textContent = `${memberData.member.first_name} ${memberData.member.last_name}`;
            
            // Debug: Log the tasks data to see its structure
            console.log('Tasks data:', tasks);
            console.log('First task:', tasks[0]);
            
            // Update tasks list
            // const tasksList = taskPopup.querySelector('#tasksList');
            // if (tasksList) {
            //     tasksList.innerHTML = tasks.map(task => {
            //         // Debug: Log each task to see its properties
            //         console.log('Processing task:', task);
                    
            //         // Handle different possible property names for title
            //         const taskTitle = task.title || task.name || task.task_title || task.task_name || 'ไม่มีชื่อภาระงาน';
            //         const taskDescription = task.description || task.desc || task.task_description || '';
                    
            //         return `
            //             <div class="task-item sarabun-16">
            //                 <strong>${taskTitle}</strong>
            //                 ${taskDescription ? `<br><span class="task-description">${taskDescription}</span>` : ''}
            //             </div>
            //         `;
            //     }).join('');
            // }
            
            taskPopup.classList.add('active');
            return; // Don't proceed with deletion yet
        }

        // If no tasks, proceed with direct deletion
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
            // Close popup before reload
            popup.classList.remove('active');
            document.getElementById('overlay').classList.remove('active');
            document.body.classList.remove('lock-scroll');
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
        document.body.classList.remove('lock-scroll');
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

    // Add email input handlers for create form
    const createEmailInput = document.querySelector('#createMemberForm input[name="email"]');
    if (createEmailInput) {
        createEmailInput.addEventListener('blur', function() {
            handleCMUEmail(this);
        });
    }

    // Add email input handlers for edit form
    const editEmailInput = document.querySelector('#editMemberForm input[name="email"]');
    if (editEmailInput) {
        editEmailInput.addEventListener('blur', function() {
            handleCMUEmail(this);
        });
    }
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

// Add this function to handle CMU email auto-fill
function handleCMUEmail(input) {
    // Remove @cmu.ac.th if it was manually entered
    let value = input.value.trim();
    if (value.includes('@')) {
        value = value.split('@')[0];
    }
    input.value = value;
}

// Drag and Drop functionality for member cards
function initializeMemberDragAndDrop() {
    console.log('Initializing member drag and drop...');
    
    // Check if user is admin or headstaff (has permission to reorder)
    const userRole = document.querySelector('meta[name="user-role"]')?.content;
    console.log('User role:', userRole);
    
    if (!userRole || (userRole !== 'admin' && userRole !== 'headstaff')) {
        console.log('User does not have permission to reorder members');
        return; // Don't initialize drag and drop for non-admin/non-headstaff users
    }

    addMemberDragAndDropStyles();
    
    const memberCards = document.querySelectorAll('.card-wrapper, .card-wrapper-headstaff');
    console.log('Found member cards:', memberCards.length);
    
    memberCards.forEach((card, index) => {
        // Remove any existing listeners first
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        // Set draggable attribute and cursor
        newCard.setAttribute('draggable', 'true');
        newCard.style.cursor = 'grab';
        
        console.log(`Setting up drag for member card ${index}:`, newCard.dataset.memberId);
        
        // Add drag event listeners to the card
        newCard.addEventListener('dragstart', handleMemberDragStart);
        newCard.addEventListener('dragover', handleMemberDragOver);
        newCard.addEventListener('dragenter', handleMemberDragEnter);
        newCard.addEventListener('dragleave', handleMemberDragLeave);
        newCard.addEventListener('drop', handleMemberDrop);
        newCard.addEventListener('dragend', handleMemberDragEnd);
        
        // Add click navigation functionality
        addMemberClickNavigation(newCard);
        
        // Test event listener
        newCard.addEventListener('mousedown', function(e) {
            console.log('Mouse down on member card:', this.dataset.memberId);
        });
    });
    
    console.log('Member drag and drop initialization complete');
}

let draggedMemberCard = null;

function handleMemberDragStart(e) {
    draggedMemberCard = this;
    
    // Apply drag styles
    this.classList.add('dragging');
    this.style.opacity = '0.5';
    this.style.transform = 'rotate(5deg)';
    this.style.zIndex = '1000';
    this.style.cursor = 'grabbing';
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    
    // Disable clickable elements during drag
    const clickableElements = this.querySelectorAll('button, .card-edit, .card-container');
    clickableElements.forEach(element => {
        element.style.pointerEvents = 'none';
    });
    
    console.log('Started dragging member:', this.dataset.memberId);
}

function handleMemberDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleMemberDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this !== draggedMemberCard && draggedMemberCard) {
        console.log('Drag enter on member:', this.dataset.memberId);
        this.classList.add('drag-over');
        
        // Simple highlight for swap, same as department
        this.style.background = 'rgba(0,123,255,0.1)';
    }
}

function handleMemberDragLeave(e) {
    // Only remove classes if we're actually leaving the element
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
        this.style.background = '';
    }
}

function handleMemberDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Drop event on member:', this.dataset.memberId);
    
    if (this !== draggedMemberCard && draggedMemberCard) {
        // Simple swap logic same as department
        swapMemberCards(draggedMemberCard, this);
    }
    
    // Clean up
    document.querySelectorAll('.card-wrapper[draggable="true"], .card-wrapper-headstaff[draggable="true"]').forEach(card => {
        card.classList.remove('drag-over');
        card.style.background = '';
    });
    
    return false;
}

function handleMemberDragEnd(e) {
    console.log('Member drag end');
    
    // Clean up all visual feedback
    document.querySelectorAll('.card-wrapper[draggable="true"], .card-wrapper-headstaff[draggable="true"]').forEach(card => {
        card.classList.remove('dragging', 'drag-over');
        card.style.opacity = '';
        card.style.transform = '';
        card.style.zIndex = '';
        card.style.cursor = 'grab';
        card.style.background = '';
        
        // Re-enable click events on clickable elements
        const clickableElements = card.querySelectorAll('button, .card-edit, .card-container');
        clickableElements.forEach(element => {
            element.style.pointerEvents = '';
        });
    });
    
    draggedMemberCard = null;
}

function swapMemberCards(card1, card2) {
    console.log('Swapping member cards:', {
        card1Id: card1.dataset.memberId,
        card2Id: card2.dataset.memberId
    });
    
    // Get the parent container - handle both headstaff and regular cards
    let container = card1.closest('.cards-member, .cards-headstaff');
    if (!container) {
        // Fallback to parent element if specific container not found
        container = card1.parentElement;
    }
    
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
    
    console.log('Member swap completed successfully');
    
    // Update order attributes and save to backend
    updateMemberCardOrders();
    saveMemberCardOrder();
    
    showMemberNotification('ลำดับบุคลากรได้รับการบันทึกแล้ว', 'success');
}

function updateMemberCardOrders() {
    const cards = document.querySelectorAll('.card-wrapper[data-member-id], .card-wrapper-headstaff[data-member-id]');
    cards.forEach((card, index) => {
        card.dataset.order = index;
    });
}

async function saveMemberCardOrder() {
    try {
        const cards = document.querySelectorAll('.card-wrapper[data-member-id], .card-wrapper-headstaff[data-member-id]');
        const orderData = Array.from(cards).map((card, index) => ({
            id: parseInt(card.dataset.memberId),
            order: index
        }));
        
        console.log('Saving new member order:', orderData);
        
        const response = await fetch('/members/reorder', {
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
            throw new Error(data.message || 'Failed to save member order');
        }
        
        console.log('Member order saved successfully');
        
    } catch (error) {
        console.error('Error saving member order:', error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกลำดับบุคลากร';
        
        if (error.message.includes('order')) {
            errorMessage = 'ต้องเพิ่มคอลัมน์ order ในฐานข้อมูลก่อน - กรุณาเรียกใช้ migration';
            showMemberNotification(errorMessage, 'warning');
            console.warn('❌ DATABASE SETUP REQUIRED ❌');
            console.warn('Please run: php artisan migrate');
            return;
        } else if (error.message.includes('Route')) {
            console.warn('Reorder endpoint not available - this is expected during development');
            showMemberNotification('การเรียงลำดับได้ถูกบันทึกชั่วคราว (รอการอัพเดทฐานข้อมูล)', 'info');
            return;
        }
        
        showMemberNotification(errorMessage, 'error');
        
        // Only reload page for other types of errors
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

function addMemberDragAndDropStyles() {
    const existingStyle = document.getElementById('member-drag-drop-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'member-drag-drop-styles';
    style.textContent = `
        .card-wrapper[draggable="true"],
        .card-wrapper-headstaff[draggable="true"] {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            position: relative;
            cursor: grab !important;
        }
        
        .card-wrapper[draggable="true"]:active,
        .card-wrapper-headstaff[draggable="true"]:active {
            cursor: grabbing !important;
        }
        
        .card-wrapper.dragging,
        .card-wrapper-headstaff.dragging {
            transform: rotate(5deg) scale(1.05) !important;
            z-index: 1000 !important;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3) !important;
            opacity: 0.8 !important;
            cursor: grabbing !important;
        }
        
        .card-wrapper.drag-over,
        .card-wrapper-headstaff.drag-over {
            transform: scale(1.02) !important;
            box-shadow: 0 4px 12px rgba(244, 142, 46, 0.3) !important;
            background: rgba(244, 142, 46, 0.1) !important;
            border-radius: 30px !important;
        }
        
        /* Ensure drag doesn't interfere with card content */
        .card-wrapper.dragging .card-container,
        .card-wrapper-headstaff.dragging .card-container,
        .card-wrapper.dragging a,
        .card-wrapper-headstaff.dragging a,
        .card-wrapper.dragging button,
        .card-wrapper-headstaff.dragging button,
        .card-wrapper.dragging .card-edit,
        .card-wrapper-headstaff.dragging .card-edit {
            pointer-events: none !important;
        }
        
        /* Add visual feedback for admin/headstaff users */
        .card-wrapper[draggable="true"]::before,
        .card-wrapper-headstaff[draggable="true"]::before {            
            position: absolute;
            top: 10px;
            right: 10px;
            color: #ccc;
            font-size: 16px;
            line-height: 8px;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .card-wrapper[draggable="true"]:hover::before,
        .card-wrapper-headstaff[draggable="true"]:hover::before {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    console.log('Member drag and drop styles added');
}

function showMemberNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.member-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `member-notification ${type}`;
    notification.textContent = message;
    
    // Style the notification - matching department implementation
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
    if (!document.getElementById('memberNotificationStyles')) {
        const notificationStyle = document.createElement('style');
        notificationStyle.id = 'memberNotificationStyles';
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
    
    // Auto remove after 3 seconds - same as department
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Initialize drag and drop when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Member page DOM loaded, initializing drag and drop');
    initializeMemberDragAndDrop();
});

// Function to handle click navigation for member cards
function addMemberClickNavigation(card) {
    const memberUrl = card.dataset.memberUrl;
    const cardContainer = card.querySelector('.card-container');
    
    if (!memberUrl || !cardContainer) return;
    
    // Check if user can view this member (not disabled)
    if (cardContainer.classList.contains('disabled-card')) return;
    
    let isDragging = false;
    let dragStartTime = 0;
    
    // Track when potential drag starts
    card.addEventListener('mousedown', function(e) {
        // Don't interfere with edit button clicks
        if (e.target.closest('.card-edit')) return;
        
        isDragging = false;
        dragStartTime = Date.now();
    });
    
    // Track if user is dragging
    card.addEventListener('dragstart', function(e) {
        isDragging = true;
    });
    
    // Handle click navigation
    card.addEventListener('click', function(e) {
        // Don't navigate if clicking on edit button
        if (e.target.closest('.card-edit')) return;
        
        // Don't navigate if we were dragging
        if (isDragging) return;
        
        // Don't navigate if this was a long press (potential drag attempt)
        const timeDiff = Date.now() - dragStartTime;
        if (timeDiff > 200) return;
        
        // Navigate to member page
        window.location.href = memberUrl;
    });
    
    // Add hover effect for clickable cards
    cardContainer.style.cursor = 'pointer';
    cardContainer.addEventListener('mouseenter', function() {
        if (!isDragging) {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
        }
    });
    
    cardContainer.addEventListener('mouseleave', function() {
        if (!isDragging) {
            this.style.transform = '';
        }
    });
}
