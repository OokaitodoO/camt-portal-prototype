<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>ข้อมูลบุคลากร</title>

    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/individual.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/pages/task.css') }}">
    <meta name="member-id" content="{{ $member->id }}">
    <meta name="member-name" content="{{ $member->first_name }} {{ $member->last_name }}">
    <meta name="department-id" content="{{ $member->department_id }}">
</head>
<body class="body-bg">
    <!-- Header -->
    <header>
        <div class="role-container">
            <div class="user-dropdown">
                <div class="btn-status btn-text sarabun-20" onclick="toggleUserDropdown()">
                    {{ Auth::user()->first_name }} {{ Auth::user()->last_name }}
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="dropdown-menu" id="userDropdown">
                    <div class="dropdown-item sarabun-16">
                        @php
                            $roleLabels = [
                                'admin' => 'ผู้ดูแลระบบ',
                                'manager' => 'ผู้บริหาร',
                                'headstaff' => 'หัวหน้างาน',
                                'staff' => 'บุคลากร'
                            ];
                        @endphp
                        {{ $roleLabels[Auth::user()->role] ?? 'ไม่ระบุตำแหน่ง' }}
                    </div>
                    <div class="dropdown-divider"></div>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="dropdown-item sarabun-16">
                            <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <nav class="nav-bar">
            <div class="nav-bar-action-container">
                <img src="{{ asset('images/CamtLogo.png') }}" alt="Logo" onerror="this.src='https://placehold.co/200x50'">
                <ul class="nav-action">
                    @if(!Auth::user()->isStaff())
                    <li><a href="{{route('departments.index')}}" class="btn-nav btn-text sarabun-20">หน่วยงาน</a></li>                
                    <li><a href="{{ route('members.index') }}" class="btn-nav-active btn-text sarabun-20">บุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav btn-text sarabun-20">ภาระงาน</a></li>
                    @else
                    <li><a href="{{route('departments.index')}}" class="btn-nav btn-text sarabun-20">หน่วยงาน</a></li>                
                    <li><a href="{{ route('members.index') }}" class="btn-nav btn-text sarabun-20">บุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav-active btn-text sarabun-20">ภาระงาน</a></li>
                    @endif
                </ul>
            </div>
            @if(Auth::user()->isNotManager())
                <div class="btn-create btn-text sarabun-20" id="popupButton" onclick="openCreatePopup()">
                        <i class="fas fa-plus"></i> เพิ่มภาระงาน
                </div>
            @endif
        </nav>
        <div class="search-tab">
            <div class="title slide-in">
                <h1 class="page-title sarabun-36">ข้อมูลบุคลากร > {{ $member->first_name }} {{ $member->last_name }}</h1>
            </div>
        </div>
    </header>

    <!-- Individual Member Content -->
    <section class="content-container">
        <!-- side nav -->
        <div class="side-nav-container slide-right">
            <div class="side-nav-logo">
                <img src="{{ $member->profile_picture ? asset('storage/' . str_replace('storage/', '', $member->profile_picture)) : 'https://placehold.co/128' }}" 
                     class="card-logo-img" alt="logo">
            </div>
            <div class="side-nav-info-item">
                <div class="divider"></div>
            </div>
            <div class="side-nav-info">
                <div class="side-nav-info-name">
                    <h2 class="sarabun-24">{{ $member->first_name }} {{ $member->last_name }}</h2>
                </div>   
                <div class="side-nav-info-item">
                    <h2 class="sarabun-18">ตำแหน่งงาน: </h2>
                    <p class="sarabun-18">{{ $member->position }}</p>
                </div>         
                <div class="side-nav-info-item">
                    <h2 class="sarabun-18">หน่วยงาน: </h2>
                    <p class="sarabun-18">{{ $member->department->name }}</p>
                </div>
                <div class="side-nav-info-item">
                    <h2 class="sarabun-18">หน่วยงานย่อย: </h2>
                    <p class="sarabun-18">{{ $member->sub_department ?? '-' }}</p>
                </div>
                <div class="side-nav-info-item">
                    <h2 class="sarabun-18">บทบาท: </h2>
                    <p class="sarabun-18">
                        @php
                            $roleLabels = [
                                'admin' => 'ผู้ดูแลระบบ',
                                'manager' => 'ผู้บริหาร',
                                'headstaff' => 'หัวหน้างาน',
                                'staff' => 'บุคลากร'
                            ];
                        @endphp
                        {{ $roleLabels[$member->role] ?? 'ไม่ระบุตำแหน่ง' }}
                    </p>
                </div>
                <div class="side-nav-info-item">
                    <div class="divider"></div>
                </div>
                <div class="side-nav-info-item">
                    <h2 class="sarabun-18">อีเมล: </h2>
                    <p class="sarabun-18">{{ $member->email ?? '-' }}</p>
                </div>
                <div class="side-nav-info-item">
                    <h2 class="sarabun-18">เบอร์โทร: </h2>
                    <p class="sarabun-18">
                        @php
                            $phone = $member->phone;
                            if ($phone) {
                                // Remove any non-digit characters
                                $phone = preg_replace('/[^0-9]/', '', $phone);
                                // Format as xxx-xxx-xxxx
                                $phone = substr($phone, 0, 3) . '-' . 
                                        substr($phone, 3, 3) . '-' . 
                                        substr($phone, 6);
                            }
                        @endphp
                        {{ $phone ?? '-' }}
                    </p>
                </div>
                <div class="side-nav-info-item">
                    <div class="divider"></div>
                </div>
            </div>
            <div class="side-nav-pin">
                <h3 class="sarabun-20">ภาระงานที่ใช้บ่อย</h3>
                <div class="favorite-tasks">
                    @foreach($assignedTasks->where('is_favorite', true) as $favTask)
                    <div class="favorite-task-item">
                        <img src="{{ $favTask->logo_path ? asset('storage/' . str_replace('storage/', '', $favTask->logo_path)) : 'https://placehold.co/25' }}" 
                             class="nav-logo-img" alt="logo">
                        <a href="javascript:void(0)" 
                           onclick="openTaskLink(event, '{{ $favTask->link }}')" 
                           class="favorite-task-link sarabun-16">
                            {{ $favTask->title }}
                        </a>
                    </div>
                    @endforeach
                </div>
            </div>  
        </div>
        

        <!-- content -->
        <div class="content">
            <div class="content-task">
                @php
                    // Get tasks assigned to this member and sort by favorite status
                    $assignedTasks = \App\Models\Task::with(['department', 'assignedBy', 'subTasks'])
                        ->where('assigned_to', $member->id)
                        ->get()
                        ->sortByDesc('is_favorite');
                @endphp

                @if($assignedTasks && $assignedTasks->count() > 0)
                    @foreach($assignedTasks as $task)
                    <div class="card-wrapper fade-in">
                        <div class="card-container"  onclick="openTaskLink(event, '{{ $task->link }}')">
                            <div class="card-header">
                                <div class="card-top">
                                    @if($task->assigned_to == Auth::user()->id)
                                    <div class="card-favorite" onclick="toggleFavorite(event, {{ $task->id }}, this)" 
                                         data-favorite="{{ $task->is_favorite }}">
                                        <i class="fas fa-star {{ $task->is_favorite ? 'favorite-active' : '' }}"></i>
                                    </div>
                                    @endif
                                    @if(Auth::user()->isNotManager())
                                    <div class="card-edit" onclick="openEditPopup(this); event.stopPropagation();" 
                                         data-task-id="{{ $task->id }}">
                                        <i class="fas fa-edit"></i>
                                    </div>
                                    @endif
                                </div>
                                <div class="card-logo">
                                    @if($task->logo_path)
                                        <img src="{{ asset('storage/' . str_replace('storage/', '', $task->logo_path)) }}" 
                                             class="card-logo-img" 
                                             alt="logo"
                                             onerror="this.src='https://placehold.co/128'">
                                    @else
                                        <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                                    @endif
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="card-container-info">
                                <div class="card-container-info-item">
                                    <div class="card-name">
                                        <h3 class="sarabun-24">{{ $task->title }}</h3> 
                                    </div>
                                </div>
                                <div class="card-container-info-item">
                                    <div class="card-details-description">
                                        <p class="sarabun-16">{{ $task->description }}</p>
                                    </div>
                                    <div class="card-details">
                                        <p class="card-date-title sarabun-16">วันครบกำหนด</p>
                                        <p class="sarabun-16">{{ $task->deadline ? \Carbon\Carbon::parse($task->deadline)->format('d/m/Y') : 'ไม่มีวันครบกำหนด' }}</p>
                                    </div>
                                    <div class="card-details">
                                        <p class="card-date-title sarabun-16">มอบหมายโดย</p>
                                        <p class="sarabun-16">{{ $task->assignedBy ? $task->assignedBy->first_name . ' ' . $task->assignedBy->last_name : 'ไม่ระบุ' }}</p>
                                    </div>
                                    @if($task->subTasks && $task->subTasks->count() > 0)
                                    <div class="card-details">
                                        <div class="subtasks-dropdown">
                                            <button class="subtasks-dropdown-btn sarabun-16" onclick="toggleSubtasks(event, '{{ $task->id }}')">
                                                <i class="fas fa-tasks"></i>                                                
                                                <i class="fas fa-chevron-down dropdown-arrow"></i>
                                            </button>
                                            <div id="subtasks-{{ $task->id }}" class="subtasks-content" style="display: none;">
                                                @foreach($task->subTasks as $subTask)
                                                <div class="subtask-item" onclick="openTaskLink(event, '{{ $subTask->link }}')">
                                                    <span class="sarabun-16">{{ $subTask->title }}</span>
                                                    @if($subTask->link)
                                                        <i class="fas fa-external-link-alt"></i>
                                                    @endif
                                                </div>
                                                @endforeach
                                            </div>
                                        </div>
                                    </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                    @endforeach
                @else
                    <div class="no-tasks-message">
                        <p class="sarabun-20">ไม่มีภาระงานในขณะนี้</p>
                    </div>
                @endif
            </div>
        </div>

        <!-- popup create task -->
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
                                <h1 class="popup-header-title sarabun-36">เพิ่มภาระงาน</h1>
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
                                <h2 class="sarabun-16">ลิ้งก์</h2>
                                <input type="text" name="link" placeholder="ลิ้งก์..." class="input-text sarabun-16">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">มอบหมายภาระงานให้</h2>
                                <div class="member-search-container">
                                    <div class="search-input-wrapper">
                                        <input type="text" 
                                            id="createTaskMemberSearch" 
                                            class="input-text sarabun-16" 
                                            placeholder="พิมพ์ชื่อบุคลากร...">
                                    </div>
                                </div>
                                <div id="createSelectedMembers" class="selected-members-wrapper">
                                    <div class="selected-member-tag" data-member-id="{{ $member->id }}">
                                        <span>{{ $member->first_name }} {{ $member->last_name }}</span>
                                        <i class="fas fa-times" onclick="removeSearchedMember(this)"></i>
                                        <input type="hidden" name="assigned_to[]" value="{{ $member->id }}">
                                    </div>
                                </div>
                            </div>
                            <div class="popup-input-wrapper">
                                <div class="date-picker">
                                    <h2 class="sarabun-16">วันครบกำหนด</h2>
                                    <input type="date" name="deadline" class="input-text sarabun-16">
                                </div>
                            </div>
                        </div>
                        <hr class="divider">
                        <div id="createSubTasksContainer" class="popup-sub-task-wrapper">
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

        <!-- Edit Task Popup -->
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
                                <h1 class="popup-header-title sarabun-36">แก้ไขภาระงาน</h1>
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
                                <h2 class="sarabun-16">ลิ้งก์</h2>
                                <input type="text" name="link" id="editTaskLink" placeholder="ลิ้งก์..." class="input-text sarabun-16">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ผู้รับผิดชอบ</h2>
                                <input type="text" id="editTaskAssignedTo" class="input-text sarabun-16" readonly>
                                <input type="hidden" name="assigned_to" id="editTaskAssignedToId">
                            </div>
                            <div class="popup-input-wrapper">
                                <div class="date-picker">
                                    <h2 class="sarabun-16">วันครบกำหนด</h2>
                                    <input type="date" 
                                           name="deadline" 
                                           id="editTaskDeadline" 
                                           class="input-text sarabun-16">
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
        
    </section>

    <!-- script -->
    @vite('resources/js/app.js')
    @vite('resources/js/task.js')
    @vite('resources/js/individual.js')
    
</body>
</html>
