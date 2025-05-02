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
                    <li><a href="{{route('department')}}" class="btn-nav btn-text sarabun-20">หน่วยงาน</a></li>
                    <li><a href="{{ route('members.index') }}" class="btn-nav-active btn-text sarabun-20">บุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav btn-text sarabun-20">ภาระงาน</a></li>
                </ul>
            </div>
            <div class="btn-create btn-text sarabun-20" id="popupButton" onclick="openCreatePopup()">
                    <i class="fas fa-plus"></i> เพิ่มภาระงาน
            </div>
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
                <img src="{{ $member->profile_picture ? Storage::url($member->profile_picture) : 'https://placehold.co/128' }}" 
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
                    <p class="sarabun-18">{{ $member->role }}</p>
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
                    <p class="sarabun-18">{{ $member->phone ?? '-' }}</p>
                </div>
                <div class="side-nav-info-item">
                    <div class="divider"></div>
                </div>
            </div>
            <div class="side-nav-pin">
                <h3 class="sarabun-20">ภาระงานที่ใช้บ่อย</h3>
                <div class="dropdown">
                    <div class="dropdown-btn" onclick="toggleDropdownDepartment()">
                        <span class="selected-text sarabun-16">เลือกภาระงาน</span>
                        <button>▼</button>
                    </div>
                    <div class="dropdown-content sarabun-16" id="dropdownMenuDepartment">
                        <a href="#" onclick="selectDepartment(this)">ภาระงาน 1</a>
                        <a href="#" onclick="selectDepartment(this)">ภาระงาน 2</a>
                        <a href="#" onclick="selectDepartment(this)">ภาระงาน 3</a>
                    </div>
                </div>
            </div>  
        </div>
        

        <!-- content -->
        <div class="content">
            <div class="content-task">
                @if($member->tasks && $member->tasks->count() > 0)
                    @foreach($member->tasks as $task)
                    <div class="card-wrapper fade-in">
                        <div class="card-container">
                            <div class="card-logo">
                                <img src="{{ $task->icon_path ?? 'https://placehold.co/128' }}" 
                                     class="card-logo-img" alt="logo">
                            </div>
                            <div class="divider"></div>
                            <div class="card-container-info">
                                <div class="card-container-info-item">
                                    <div class="card-name">
                                        <h3 class="sarabun-24">{{ $task->name }}</h3> 
                                    </div>
                                </div>
                                <div class="card-container-info-item">
                                    <div class="card-details">
                                        <p class="sarabun-16">{{ $task->description }}</p>
                                    </div>
                                    <div class="card-details">
                                        <p class="card-date-title sarabun-16">วันครบกำหนด</p>
                                        <p class="sarabun-16">{{ $task->deadline ?? 'ไม่มีกำหนด' }}</p>
                                    </div>
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

        <!-- popup -->
        <div id="popupCreate" class="popup-container">
            <div class="create-popup-department">
                <div class="popup-content">
                    <div class="popup-header">
                        <div class="btn-close close-popup" onclick="closeCreatePopup()"> <!-- close button -->
                            <   
                        </div>
                        <div class="popup-name">
                            <h1 class="page-title sarabun-36">เพิ่มบุคลากร</h1>
                        </div>
                    </div>
                    <div class="popup-image">
                        <img src="https://placehold.co/128" alt="" class="card-logo-img">
                    </div>
                    <div class="popup-input-container">
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">ชื่อภาระงาน</h2>
                            <input type="text" placeholder="ภาระงาน..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">รายละเอียด</h2>
                            <input type="text" placeholder="รายละเอียด..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">หน่วยงาน</h2>
                            <div class="dropdown">
                                <div class="dropdown-btn" onclick="toggleDropdownDepartment()">
                                    <span class="selected-text sarabun-16">เลือกหน่วยงาน</span>
                                    <button>▼</button>
                                </div>
                                <div class="dropdown-content sarabun-16" id="dropdownMenuDepartment">
                                    <a href="#" onclick="selectDepartment(this)">หน่วยงาน 1</a>
                                    <a href="#" onclick="selectDepartment(this)">หน่วยงาน 2</a>
                                    <a href="#" onclick="selectDepartment(this)">หน่วยงาน 3</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">ลิ้งก์</h2>
                            <input type="text" placeholder="ลิ้งก์..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">มอบหมายภาระงานให้</h2>
                            <div class="dropdown">
                                <div class="dropdown-btn" onclick="toggleDropdownMember()">
                                    <span class="selected-text sarabun-16">เลือกบุคลากร</span>
                                    <button>▼</button>
                                </div>
                                <div class="dropdown-content sarabun-16" id="dropdownMenuMember">
                                    <a href="#" onclick="selectMember(this)">บุคลากร 1</a>
                                    <a href="#" onclick="selectMember(this)">บุคลากร 2</a>
                                    <a href="#" onclick="selectMember(this)">บุคลากร 3</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-input-wrapper">
                            <div class="date-picker">
                                <h2 class="sarabun-16">วันครบกำหนด</h2>
                                <input type="date" id="deadline" name="deadline">
                            </div>
                        </div>
                    </div>
                    <hr class="divider">
                    <div class="popup-sub-task-wrapper">
                        <div class="popup-sub-task">
                            <div class="popup-sub-task-detail">
                                <div class="popup-input-wrapper">
                                    <h2 class="sarabun-16">ภาระงานย่อย 1</h2>
                                    <input type="text" placeholder="ภาระงาน..." class="input-text">
                                </div>
                                <div class="popup-input-wrapper">
                                    <h2 class="sarabun-16">ลิ้งก์</h2>
                                    <input type="text" placeholder="ลิ้งก์..." class="input-text">
                                </div>
                            </div>
                            <div class="popup-sub-task-delete">
                                <a href="">Q</a>
                            </div>
                        </div>
                    </div>
                    <div class="popup-btn-wrapper">
                        <div class="btn btn-cancel close-popup" onclick="closeCreatePopup()">
                            <p class="sarabun-20">ยกเลิก</p>
                        </div>
                        <div class="btn btn-confirm" id="confirmButton" onclick="createNewTask()">
                            <p class="sarabun-20">ตกลง</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="overlay"></div>
        
    </section>

    <!-- script -->
    @vite('resources/js/app.js')
    
</body>
</html>
