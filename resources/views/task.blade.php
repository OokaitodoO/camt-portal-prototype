<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>ภาระงาน</title>

    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/task.css') }}">
    <!-- Add Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body class="body-bg">
    <!-- Header -->
    <header>
        <div class="role-container">
            <ul>
                <li class="btn-status btn-text sarabun-20">
                    @php
                        $roleLabels = [
                            'admin' => 'ผู้ดูแลระบบ',
                            'manager' => 'ผู้บริหาร',
                            'headstaff' => 'หัวหน้างาน',
                            'staff' => 'บุคลากร'
                        ];
                    @endphp
                    {{ $roleLabels[Auth::user()->role] ?? 'ไม่ระบุตำแหน่ง' }}
                </li>
            </ul>
        </div>
        <nav class="nav-bar">
            <div class="nav-bar-action-container">
                <img src="{{ asset('images/CamtLogo.png') }}" alt="Logo" onerror="this.src='https://placehold.co/200x50'">
                <ul class="nav-action">
                    <li><a href="{{ route('department') }}" class="btn-nav btn-text sarabun-20">หน่วยงาน</a></li>
                    <li><a href="{{ route('members.index') }}" class="btn-nav btn-text sarabun-20">บุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav-active btn-text sarabun-20">ภาระงาน</a></li>
                </ul>
            </div>
            <div id="popupButton" class="btn-create btn-text sarabun-20" onclick="openCreatePopup()">
                    <i class="fas fa-plus"></i> เพิ่มภาระงาน
            </div>
        </nav>
        <div class="search-tab">
            <div class="title slide-in sarabun-36">
                <h1 class="page-title">ภาระงาน</h1>
            </div>
            <div class="search-bar">
                <input type="text" placeholder="ค้นหา" class="sarabun-16">
            </div>
        </div>
    </header>

    <!-- Content -->
    <section class="content-container">

        <div class="side-nav-container slide-right">
            <div class="side-nav">
                <h3 class="sarabun-20">หน่วยงานทั้งหมด</h3>   
                <div class="btn-side-nav" onclick="filterTasksByDepartment('all')">
                    <img src="{{ $department->icon_path ?? 'https://placehold.co/25' }}" class="nav-logo-img" alt="all">
                    <div class="btn-side-nav-text sarabun-18">
                        ทั้งหมด
                    </div>
                </div>
                @foreach($departments as $department)
                    <div class="btn-side-nav" onclick="filterTasksByDepartment({{ $department->id }})">
                        <img src="{{ $department->icon_path ?? 'https://placehold.co/25' }}" class="nav-logo-img" alt="logo">
                        <div class="btn-side-nav-text sarabun-18">
                            {{ $department->name }}
                        </div>
                    </div>
                @endforeach
            </div> 
        </div>

        <!-- task tables by department -->
        <div class="content">
            <div class="task-remain slide-in">
                <h3 class="sarabun-20">จำนวนภาระงาน</h3>
                <p class="sarabun-20">{{ $tasks->count() }}</p>
            </div>

            @foreach($departments as $department)
                @php
                    $departmentTasks = $tasks->where('department_id', $department->id);
                @endphp
                
                @if($departmentTasks->count() > 0)
                    <div class="task-department">
                        <h1 class="page-title slide-in sarabun-36">{{ $department->name }}</h1>
                        <table class="fade-in">
                            <tr class="table-title sarabun-16">
                                <th>ภาระงาน</th>
                                <th>หน่วยงาน</th>
                                <th>ผู้รับผิดชอบ</th>
                                <th>มอบหมายโดย</th>
                                <th onclick="sortByDeadline('{{ $department->id }}')" style="cursor: pointer">
                                    วันครบกำหนด 
                                    <i class="fas fa-sort"></i>
                                </th>
                                <th>แก้ไข</th>
                            </tr>
                            <tbody id="taskTableBody-{{ $department->id }}">
                                @foreach($departmentTasks->sortBy('deadline') as $task)
                                    <tr class="table-task">
                                        <td class="border-top sarabun-16">{{ $task->title }}</td>
                                        <td class="border-top sarabun-16">{{ $task->department->name }}</td>
                                        <td class="border-top sarabun-16">{{ optional($task->assignedTo)->first_name ?? '-' }}</td>
                                        <td class="border-top sarabun-16">{{ optional($task->assignedBy)->first_name ?? '-' }}</td>
                                        <td class="border-top sarabun-16">
                                            @if($task->deadline)
                                                {{ \Carbon\Carbon::parse($task->deadline)->format('d/m/Y') }}
                                            @else
                                                ไม่มีวันครบกำหนด
                                            @endif
                                        </td>
                                        <td class="border-top" onclick="openEditPopup(this)" data-task-id="{{ $task->id }}">
                                            <div class="btn-edit">
                                                <i class="fas fa-edit"></i>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            @endforeach
        </div>

        <!-- popup create new task -->
        <div id="popupCreate" class="popup-container">
            <div class="create-popup-department">
                <div class="popup-content">
                    <form id="createTaskForm">
                        @csrf
                        <div class="popup-header">
                            <div class="btn-close close-popup" onclick="closeCreatePopup()">
                                <   
                            </div>
                            <div class="popup-name">
                                <h1 class="page-title sarabun-36">เพิ่มภาระงาน</h1>
                            </div>
                        </div>
                        <div class="popup-image">
                            <label for="taskLogo" class="logo-upload-label">
                                <img src="https://placehold.co/128" alt="" class="card-logo-img" id="taskLogoPreview">
                                <div class="upload-overlay">
                                    <i class="fas fa-camera"></i>
                                    <span>อัพโหลดรูปภาพ</span>
                                </div>
                            </label>
                            <input type="file" name="logo" id="taskLogo" accept="image/*" style="display: none;">
                        </div>
                        <div class="popup-input-container">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ชื่อภาระงาน</h2>
                                <input type="text" name="title" placeholder="ภาระงาน..." class="input-text sarabun-16" required>
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">รายละเอียด</h2>
                                <input type="text" name="description" placeholder="รายละเอียด..." class="input-text sarabun-16">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">หน่วยงาน</h2>
                                <div class="dropdown">
                                    <button type="button" class="dropdown-btn" onclick="toggleDropdownDepartment('dropdownMenuDepartmentCreate')">
                                        <span id="createTaskDepartment" class="selected-text" data-department-id="">เลือกหน่วยงาน</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div id="dropdownMenuDepartmentCreate" class="dropdown-content">
                                        <!-- Departments will be loaded here -->
                                    </div>
                                </div>
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ลิ้งก์</h2>
                                <input type="text" name="link" placeholder="ลิ้งก์..." class="input-text sarabun-16">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">มอบหมายภาระงานให้</h2>
                                <div class="dropdown">
                                    <button type="button" class="dropdown-btn" onclick="toggleDropdownMember('dropdownMenuMemberCreate')">
                                        <span id="createTaskAssignedTo" class="selected-text" data-member-id="">เลือกบุคลากร</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div id="dropdownMenuMemberCreate" class="dropdown-content">
                                        <!-- Members will be loaded here -->
                                    </div>
                                </div>
                            </div>
                            <div class="popup-input-wrapper">
                                <div class="date-picker">
                                    <h2 class="sarabun-16">วันครบกำหนด</h2>
                                    <input type="date" name="deadline" required>
                                </div>
                            </div>
                        </div>
                        <hr class="divider">
                        <div class="popup-sub-task-wrapper" id="createSubTasksContainer">
                            <!-- Subtasks will be added here -->
                        </div>
                        <div class="add-subtask-btn btn-pointer" onclick="addNewSubTask('create')">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="popup-btn-wrapper">
                            <button type="button" class="btn btn-cancel close-popup sarabun-20" onclick="closeCreatePopup()">
                                ยกเลิก
                            </button>
                            <button type="button" class="btn btn-confirm sarabun-20" onclick="createNewTask()">
                                ตกลง
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- popup edit task -->
        <div id="popupEdit" class="popup-container">
            <div class="create-popup-department">
                <div class="popup-content">
                    <form id="editTaskForm">
                        @csrf
                        <input type="hidden" id="editTaskId" name="task_id">
                        <div class="popup-header">
                            <div class="btn-close close-popup" onclick="closeEditPopup()">
                                <   
                            </div>
                            <div class="popup-name">
                                <h1 class="page-title sarabun-36">แก้ไขภาระงาน</h1>
                            </div>
                            <div class="popup-delete btn-pointer" onclick="openDeleteConfirmationPopup()">
                                <i class="fas fa-trash"></i>
                            </div>
                        </div>
                        <div class="popup-image">
                            <label for="editTaskLogo" class="logo-upload-label">
                                <img src="" alt="" class="card-logo-img" id="editTaskLogoPreview">
                                <div class="upload-overlay">
                                    <i class="fas fa-camera"></i>
                                    <span>อัพโหลดรูปภาพ</span>
                                </div>
                            </label>
                            <input type="file" name="logo" id="editTaskLogo" accept="image/*" style="display: none;">
                        </div>
                        <div class="popup-input-container">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ชื่อภาระงาน</h2>
                                <input type="text" name="title" id="editTaskTitle" placeholder="ภาระงาน..." class="input-text sarabun-16" required>
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">รายละเอียด</h2>
                                <input type="text" name="description" id="editTaskDescription" placeholder="รายละเอียด..." class="input-text sarabun-16">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">หน่วยงาน</h2>
                                <div class="dropdown">
                                    <button type="button" class="dropdown-btn" onclick="toggleDropdownDepartment('dropdownMenuDepartmentEdit')">
                                        <span id="editTaskDepartment" class="selected-text" data-department-id="">เลือกหน่วยงาน</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div id="dropdownMenuDepartmentEdit" class="dropdown-content">
                                        <!-- Departments will be loaded here -->
                                    </div>
                                </div>
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ลิ้งก์</h2>
                                <input type="text" name="link" id="editTaskLink" placeholder="ลิ้งก์..." class="input-text sarabun-16">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">มอบหมายภาระงานให้</h2>
                                <div class="dropdown">
                                    <button type="button" class="dropdown-btn" onclick="toggleDropdownMember('dropdownMenuMemberEdit')">
                                        <span id="editTaskAssignedTo" class="selected-text" data-member-id="">เลือกบุคลากร</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div id="dropdownMenuMemberEdit" class="dropdown-content">
                                        <!-- Members will be loaded here -->
                                    </div>
                                </div>
                            </div>
                            <div class="popup-input-wrapper">
                                <div class="date-picker">
                                    <h2 class="sarabun-16">วันครบกำหนด</h2>
                                    <input type="date" id="editTaskDeadline" name="deadline" required>
                                </div>
                            </div>
                        </div>
                        <hr class="divider">
                        <div id="editSubTasksContainer" class="popup-sub-task-wrapper">
                            <!-- Subtasks will be loaded here -->
                        </div>
                        <div class="add-subtask-btn btn-pointer" onclick="addNewSubTask('edit')">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="popup-btn-wrapper">
                            <button type="button" class="btn btn-cancel close-popup sarabun-20" onclick="closeEditPopup()">
                                ยกเลิก
                            </button>
                            <button type="button" class="btn btn-confirm sarabun-20" onclick="updateTask()">
                                ตกลง
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Popup -->
        <div id="deleteConfirmationPopup" class="popup-container">
            <div class="confirmation-popup">
                <div class="popup-content">
                    <div class="popup-header">
                        <div class="popup-name">
                            <h1 class="page-title sarabun-36">ต้องการลบภาระงานนี้หรือไม่?</h1>
                        </div>
                    </div>
                    <div class="card-logo">
                        <img src="" id="deleteTaskLogo" class="card-logo-img" alt="logo">
                    </div>
                    <div class="divider"></div>
                    <div class="card-info-container">
                        <div class="card-info-item">
                            <h2 class="sarabun-16">ชื่อภาระงาน:</h2>
                            <p id="deleteTaskTitle" class="sarabun-16"></p>
                        </div>
                        <div class="card-info-item">
                            <h2 class="sarabun-16">รายละเอียด:</h2>
                            <p id="deleteTaskDescription" class="sarabun-16"></p>
                        </div>
                        <div class="card-info-item">
                            <h2 class="sarabun-16">หน่วยงาน:</h2>
                            <p id="deleteTaskDepartment" class="sarabun-16"></p>
                        </div>
                        <div class="card-info-item">
                            <h2 class="sarabun-16">ผู้รับผิดชอบ:</h2>
                            <p id="deleteTaskAssignedTo" class="sarabun-16"></p>
                        </div>
                        <div class="card-info-item">
                            <h2 class="sarabun-16">วันครบกำหนด:</h2>
                            <p id="deleteTaskDeadline" class="sarabun-16"></p>
                        </div>
                        <div id="deleteSubTasksContainer">
                            <!-- Subtasks will be listed here -->
                        </div>
                    </div>
                    <div class="popup-btn-wrapper">
                        <button type="button" class="btn btn-cancel sarabun-20" onclick="closeDeleteConfirmation()">
                            ยกเลิก
                        </button>
                        <button type="button" class="btn btn-confirm sarabun-20" onclick="deleteTask()">
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="overlay"></div>
        

        <!-- script -->
        @vite('resources/js/app.js')
        @vite('resources/js/task.js')
        
    </section>
</body>
</html>