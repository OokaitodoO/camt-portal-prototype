import {
    openCreatePopup,
    closeCreatePopup,
    // openEditPopup,
    closeEditPopup,
    // openDeleteConfirmationPopup,
    closeDeleteConfirmation
} from './component/button.js';
import axios from 'axios';

// Popup management
// function openCreatePopup() {
//     document.getElementById('createPopup').style.display = 'flex';
// }

// function closeCreatePopup() {
//     document.getElementById('createPopup').style.display = 'none';
//     document.querySelector('#createPopup form').reset();
//     document.getElementById('createPreviewImage').src = '/images/default-avatar.png';
// }

// Add this at the top of your file
let currentCard = null;

// Update the openEditPopup function
async function openEditPopup(element) {
    console.log('Opening edit popup for member');
    
    try {
        // Get member ID from data attribute
        const memberId = element.getAttribute('data-member-id');
        if (!memberId) {
            throw new Error('Member ID not found');
        }
        
        // Fetch member data from database
        const response = await axios.get(`/members/${memberId}`);
        if (!response.data || !response.data.member) {
            throw new Error('Failed to fetch member data');
        }

        const member = response.data.member;
        console.log('Member data:', member);

        // Store current card for deletion reference
        currentCard = element.closest('.card-container');

        // Get the edit form
        const form = document.getElementById('editMemberForm');
        if (!form) {
            throw new Error('Edit form not found');
        }

        // Set hidden member ID
        form.querySelector('input[name="id"]').value = memberId;

        // Set form values
        form.querySelector('input[name="first_name"]').value = member.first_name || '';
        form.querySelector('input[name="last_name"]').value = member.last_name || '';
        form.querySelector('input[name="position"]').value = member.position || '';
        form.querySelector('input[name="email"]').value = member.email || '';
        form.querySelector('input[name="phone"]').value = member.phone || '';
        form.querySelector('input[name="sub_department"]').value = member.sub_department || '';
        
        // Set department dropdown
        const departmentSelect = form.querySelector('select[name="department_id"]');
        if (departmentSelect) {
            departmentSelect.value = member.department_id;
        }

        // Set role dropdown
        const roleSelect = form.querySelector('select[name="role"]');
        if (roleSelect) {
            roleSelect.value = member.role;
        }

        // Show profile picture if exists
        const previewImage = document.getElementById('previewImage');
        if (previewImage) {
            previewImage.src = member.profile_picture || 'https://placehold.co/128';
        }

        // Show the popup
        document.getElementById('popupEdit').classList.add('active');
        document.getElementById('overlay').classList.add('active');

    } catch (error) {
        console.error('Error in openEditPopup:', error);
        alert('เกิดข้อผิดพลาดในการเปิดหน้าต่างแก้ไข: ' + error.message);
    }
}

// function closeEditPopup() {
//     const popup = document.getElementById('editPopup');
//     if (popup) {
//         popup.style.display = 'none';
//         // Reset form
//         document.getElementById('editForm').reset();
//     }
// }

// function openDeleteConfirmation() {
//     console.log('Opening delete confirmation...');
//     if (!currentCard) {
//         console.error('No member selected for deletion');
//         return;
//     }

//     const memberName = currentCard.querySelector('h3').textContent;
//     const popup = document.getElementById('deletePopup');
//     const nameSpan = document.getElementById('deleteMemberName');
    
//     if (popup && nameSpan) {
//         nameSpan.textContent = memberName;
//         popup.style.display = 'flex';
//     }
// }

// function closeDeletePopup() {
//     document.getElementById('deletePopup').style.display = 'none';
// }

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

    // Get buttons using the correct class names from your HTML
    const submitBtn = document.querySelector('.popup-btn-wrapper .btn-confirm');
    const cancelBtn = document.querySelector('.popup-btn-wrapper .btn-cancel');
    
    if (!submitBtn || !cancelBtn) {
        console.error('Buttons not found', { submitBtn, cancelBtn });
        return;
    }

    try {
        // Disable buttons and show loading state
        submitBtn.disabled = true;
        cancelBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังสร้าง...';

        const formData = new FormData(form);

        const response = await axios.post('/members', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            // Show success state
            submitBtn.innerHTML = '<i class="fas fa-check"></i> สำเร็จ';
            submitBtn.style.backgroundColor = '#28a745';

            // Refresh the page after successful creation
            window.location.reload();
        } else {
            throw new Error(response.data.message || 'Failed to create member');
        }

    } catch (error) {
        console.error('Error creating member:', error);
        
        if (submitBtn) {
            // Show error state
            submitBtn.innerHTML = '<i class="fas fa-times"></i> ผิดพลาด';
            submitBtn.style.backgroundColor = '#dc3545';

            // Reset button state after delay
            setTimeout(() => {
                submitBtn.disabled = false;
                if (cancelBtn) cancelBtn.disabled = false;
                submitBtn.innerHTML = 'ตกลง';
                submitBtn.style.backgroundColor = '#F48E2E';
            }, 1500);
        }

        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างบุคลากร');
    }
}

async function updateMember(event) {
    event.preventDefault();
    const form = event.target;
    const memberId = document.getElementById('editMemberId').value;
    const formData = new FormData(form);
    formData.append('_method', 'PUT');

    try {
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'กำลังบันทึก...';
        submitButton.disabled = true;

        const response = await axios.post(`/members/${memberId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            submitButton.textContent = 'บันทึกสำเร็จ!';
            submitButton.style.backgroundColor = '#28a745';
            
            // Refresh the page after successful update
            window.location.reload();
        }
    } catch (error) {
        console.error('Error updating member:', error);
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'เกิดข้อผิดพลาด';
        submitButton.style.backgroundColor = '#dc3545';
        
        setTimeout(() => {
            submitButton.textContent = 'บันทึก';
            submitButton.style.backgroundColor = '#F48E2E';
            submitButton.disabled = false;
        }, 1500);
    }
}

async function openDeleteConfirmationPopup() {
    try {
        // Get the current member data from the edit popup
        const editForm = document.getElementById('editMemberForm');
        if (!editForm) {
            console.error('Edit form not found');
            return;
        }

        const memberId = editForm.querySelector('input[name="id"]').value;
        
        // Fetch member data from database
        const response = await axios.get(`/members/${memberId}`);
        const member = response.data.member; // Access the member data from the response

        // Get delete confirmation popup
        const deletePopup = document.getElementById('deleteConfirmationPopup');
        if (!deletePopup) {
            console.error('Delete confirmation popup not found');
            return;
        }

        // Update profile image
        const profileImage = deletePopup.querySelector('.card-logo-img');
        if (profileImage) {
            profileImage.src = member.profile_picture || 'https://placehold.co/128';
        }

        // Update name
        const nameElement = deletePopup.querySelector('.card-name h2');
        if (nameElement) {
            nameElement.textContent = `${member.first_name} ${member.last_name}`;
        }

        // Update information fields
        const infoItems = deletePopup.querySelectorAll('.popup-member-infoamation-item p');
        const values = [
            member.position,
            member.department.name,
            member.sub_department || '-',
            member.email || '-',
            member.phone || '-'
        ];

        infoItems.forEach((p, index) => {
            if (values[index]) {
                p.textContent = values[index];
            }
        });

        // Store member ID for deletion
        deletePopup.setAttribute('data-member-id', memberId);

        // Close edit popup and show delete confirmation
        closeEditPopup();
        deletePopup.classList.add('active');
        document.getElementById('overlay').classList.add('active');

    } catch (error) {
        console.error('Error opening delete confirmation:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลบุคลากร');
    }
}

async function deleteMember() {
    try {
        const deletePopup = document.getElementById('deleteConfirmationPopup');
        const memberId = deletePopup.getAttribute('data-member-id');

        if (!memberId) {
            console.error('Member ID not found');
            return;
        }

        const response = await axios.delete(`/members/${memberId}`, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.data.success) {
            // Close both popups
            closeEditPopup();
            closeDeleteConfirmation();
            
            // Refresh the page after successful deletion
            window.location.reload();
        }

    } catch (error) {
        console.error('Error deleting member:', error);
        alert('เกิดข้อผิดพลาดในการลบบุคลากร');
    }
}


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
                    closeDeletePopup();
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
                closeDeletePopup();
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

// Add these CSS animations
const style = document.createElement('style');
style.textContent = `
    .deleting {
        animation: fadeOut 0.3s ease-out forwards;
    }

    @keyframes fadeOut {
        from { 
            opacity: 1;
            transform: scale(1);
        }
        to { 
            opacity: 0;
            transform: scale(0.8);
        }
    }

    .member-card {
        animation: fadeInUp 0.5s ease-out forwards;
        opacity: 0;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Department filtering
async function filterByDepartment(departmentId) {
    try {
        console.log('Filtering by department:', departmentId);

        // Make an AJAX request to get filtered members
        const response = await axios.get(`/members/filter/${departmentId}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.data || !response.data.members) {
            throw new Error('Invalid response data');
        }

        // Update the members list
        const memberCardsContainer = document.getElementById('memberCardsContainer');
        if (!memberCardsContainer) {
            throw new Error('Member cards container not found');
        }

        // Clear existing members
        memberCardsContainer.innerHTML = '';

        // Add filtered members
        if (response.data.members.length > 0) {
            response.data.members.forEach(member => {
                const memberCard = createMemberCard(member);
                memberCardsContainer.appendChild(memberCard);
            });
        } else {
            memberCardsContainer.innerHTML = `
                <div class="no-members-message">
                    <p class="sarabun-20">ไม่พบบุคลากรในหน่วยงานนี้</p>
                </div>
            `;
        }

        // Update department filter dropdown if it exists
        const departmentSelect = document.querySelector('select[name="department_filter"]');
        if (departmentSelect) {
            departmentSelect.value = departmentId;
        }

    } catch (error) {
        console.error('Error filtering members:', error);
        
        // If it's a navigation error (from department card click), redirect
        if (error.response && error.response.status === 404) {
            window.location.href = `/members/filter/${departmentId}`;
            return;
        }
        
        alert('เกิดข้อผิดพลาดในการกรองข้อมูล');
    }
}

// Helper function to create member card HTML
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'card-wrapper fade-in';
    
    const profilePicture = member.profile_picture 
        ? `/storage/${member.profile_picture}`
        : 'https://placehold.co/128';
        
    card.innerHTML = `
        <div class="card-container">
            <div class="card-edit" onclick="openEditPopup(this)" 
                data-member-id="${member.id}"
                data-first-name="${member.first_name}"
                data-last-name="${member.last_name}"
                data-position="${member.position}"
                data-department-id="${member.department_id}">
                <i class="fas fa-edit"></i>
            </div>
            <div class="card-content" onclick="window.location.href='/members/${member.id}'" style="cursor: pointer;">
                <div class="card-logo">
                    <img src="${profilePicture}" class="card-logo-img" alt="profile picture">
                </div>
                <div class="divider"></div>
                <div class="card-container-info">
                    <div class="card-name">
                        <h3 class="sarabun-24">${member.first_name} ${member.last_name}</h3>
                    </div>
                    <div class="card-details">
                        <h2 class="sarabun-16">ตำแหน่ง</h2>
                        <p class="sarabun-16">${member.position}</p>
                    </div>
                    <div class="card-details">
                        <h2 class="sarabun-16">หน่วยงาน</h2>
                        <p class="sarabun-16">${member.department.name}</p>
                    </div>
                    ${member.sub_department ? `
                        <div class="card-details">
                            <h2 class="sarabun-16">หน่วยงานย่อย</h2>
                            <p class="sarabun-16">${member.sub_department}</p>
                        </div>
                    ` : ''}
                    <div class="card-details">
                        <h2 class="sarabun-16">บทบาท</h2>
                        <p class="sarabun-16">${member.role}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Initialize page with all members
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('memberCardsContainer');
    if (container && window.initialMembers) {
        window.initialMembers.forEach(member => {
            const memberCard = createMemberCard(member);
            container.appendChild(memberCard);
        });
    }
}); 

// Make functions available globally
window.createMember = createMember;
window.filterByDepartment = filterByDepartment;
window.openEditPopup = openEditPopup;
window.deleteMember = deleteMember;
window.updateMember = updateMember;
window.previewImage = previewImage;
window.openDeleteConfirmationPopup = openDeleteConfirmationPopup;

