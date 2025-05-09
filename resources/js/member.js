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
        const response = await axios.get(`/members/${memberId}/data`);
        if (!response.data || !response.data.success) {
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

        // Show profile picture if exists, otherwise show placeholder
        const previewImage = document.getElementById('editPreviewImage');
        if (previewImage) {
            previewImage.src = member.profile_picture || 'https://placehold.co/128';
        }

        // Show the popup
        const popup = document.getElementById('popupEdit');
        if (popup) {
            popup.classList.add('active');
        }

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

        const response = await axios.post('/members', formData, {
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
        
        // Fetch member data using the new endpoint
        const response = await axios.get(`/members/${memberId}/details`);
        
        if (!response.data.success) {
            throw new Error('Failed to fetch member details');
        }

        const member = response.data.member;

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
        if (infoItems) {
            const values = [
                member.position,
                member.department?.name || '-',
                member.sub_department || '-',
                member.email || '-',
                member.phone || '-'
            ];

            infoItems.forEach((p, index) => {
                if (values[index]) {
                    p.textContent = values[index];
                }
            });
        }

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

// Add this new function to handle URL updates
function updateURL(url) {
    window.history.pushState({}, '', url);
}

function filterByDepartment(departmentId) {
    try {
        // Reset display for all sections
        document.querySelectorAll('.department-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show appropriate section
        if (departmentId === 'all') {
            // Show the "all" section that contains all departments
            const allSection = document.querySelector('.department-section[data-department="all"]');
            if (allSection) {
                allSection.style.display = 'block';
            }
        } else {
            // For specific department, show either the filtered section or the "all" section's relevant part
            const departmentSection = document.querySelector(`.department-section[data-department="${departmentId}"]`);
            if (departmentSection) {
                departmentSection.style.display = 'block';
            } else {
                // If specific section not found, show relevant part from "all" section
                const allSection = document.querySelector('.department-section[data-department="all"]');
                if (allSection) {
                    allSection.style.display = 'block';
                    // Hide irrelevant department sections within "all"
                    allSection.querySelectorAll('.cards-member').forEach(cardSection => {
                        const cards = cardSection.querySelectorAll('.card-wrapper');
                        let hasMatchingCards = false;
                        cards.forEach(card => {
                            if (card.getAttribute('data-department-id') == departmentId) {
                                hasMatchingCards = true;
                            }
                        });
                        if (!hasMatchingCards) {
                            cardSection.closest('div').style.display = 'none';
                        }
                    });
                }
            }
        }

        // Update active state of side navigation buttons
        document.querySelectorAll('.btn-side-nav').forEach(btn => {
            btn.classList.remove('active', 'btn-side-nav-active');
        });

        const activeBtn = document.querySelector(`.btn-side-nav[onclick*="filterByDepartment(${departmentId === 'all' ? "'all'" : departmentId})"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'btn-side-nav-active');
        }

        // Update member count
        const visibleMembers = document.querySelectorAll('.department-section:not([style*="display: none"]) .card-wrapper:not([style*="display: none"])').length;
        const memberCount = document.querySelector('.member-count p');
        if (memberCount) {
            memberCount.textContent = visibleMembers;
        }

    } catch (error) {
        console.error('Error filtering members:', error);
    }
}

// Function to initialize filtering if URL contains department ID
function initializeFiltering() {
    const urlParams = new URLSearchParams(window.location.search);
    const departmentId = window.location.pathname.split('/').pop();
    
    if (departmentId && !isNaN(departmentId)) {
        filterByDepartment(parseInt(departmentId));
    }
}

// Run initialization on page load
document.addEventListener('DOMContentLoaded', initializeFiltering);

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

    // Create member image preview
    const createInput = document.getElementById('memberProfilePicture');
    const createPreview = document.getElementById('previewImage');
    
    if (createInput && createPreview) {
        createInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    createPreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Edit member image preview
    const editInput = document.getElementById('editMemberProfilePicture');
    const editPreview = document.getElementById('editPreviewImage');
    
    if (editInput && editPreview) {
        editInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editPreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
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
window.updateURL = updateURL;

