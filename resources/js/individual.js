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
}

// Function to close create popup
function closeCreatePopup() {
    document.getElementById('popupCreate').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
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