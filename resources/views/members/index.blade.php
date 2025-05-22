<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เพิ่มบุคลากร</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="user-role" content="{{ Auth::user()->role }}">
    <meta name="user-department-id" content="{{ Auth::user()->department_id }}">
    <meta name="user-id" content="{{ Auth::user()->id }}">

    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/member.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
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
                    <li><a href="{{ route('departments.index') }}" class="btn-nav btn-text sarabun-20">หน่วยงาน</a></li>
                    <li><a href="{{ route('members.index') }}" class="btn-nav-active btn-text sarabun-20">บุคลากร</a></li>
                    @if(Auth::user()->isStaff())
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav{{ Request::routeIs('tasks.*') ? '-active' : '' }} btn-text sarabun-20">ภาระงาน</a></li>
                    @else
                    <li class="task-dropdown">
                        <div class="btn-nav{{ Request::routeIs('tasks.*', 'individual.*') ? '-active' : '' }} btn-text sarabun-20">
                            ภาระงาน <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="task-dropdown-menu">
                            <a href="{{ route('tasks.index') }}" class="dropdown-item sarabun-16">
                                <i class="fas fa-tasks"></i> ภาระงานทั้งหมด
                            </a>
                            <a href="{{ route('members.show', Auth::user()->id) }}" class="dropdown-item sarabun-16">
                                <i class="fas fa-user-clock"></i> ภาระงานรายบุคคล
                            </a>
                        </div>
                    </li>
                    @endif
                </ul>
            </div>
            @if(auth()->user()->isAdmin() || auth()->user()->isHeadstaff())
                <div class="btn-create btn-text sarabun-20" id="popupButton" onclick="openCreatePopup()">
                        <i class="fas fa-plus"></i> เพิ่มบุคลากร
                </div>
            @endif
        </nav>
        <div class="search-tab">
            <div class="title slide-in sarabun-36">
                <h1 class="page-title">บุคลากร</h1>
            </div>
            <div class="search-bar">
                <input type="text" placeholder="ค้นหา" class="sarabun-16">
            </div>
        </div>
    </header>

    <!-- Content -->
    <section class="content-container">
        <!-- side nav -->
        <div class="side-nav-container slide-right">
            <div class="side-nav">
                <h3 class="sarabun-20">หน่วยงานทั้งหมด</h3>   
                <div class="btn-side-nav" onclick="filterByDepartment('all'); updateURL('{{ route('members.index') }}')">
                    <img src="{{ $department->icon_path ?? 'https://placehold.co/25' }}" class="nav-logo-img" alt="all">
                    <div class="btn-side-nav-text sarabun-18">ทั้งหมด</div>
                </div>
                @foreach($departments as $department)
                    <div class="btn-side-nav" onclick="filterByDepartment({{ $department->id }}); updateURL('{{ route('members.index') }}')">
                        <img src="{{ $department->icon_path ? Storage::url($department->icon_path) : 'https://placehold.co/25' }}" 
                             class="nav-logo-img" alt="logo">
                        <div class="btn-side-nav-text sarabun-18">{{ $department->name }}</div>
                    </div>
                @endforeach               
            </div> 
        </div>

        <!-- Content area -->
        <div class="content">

            <!-- Department sections -->
            <div id="departmentSections">
                <!-- All members section (grouped by department) -->
                <div class="department-section" data-department="all">
                    @foreach($departments as $department)
                        @php
                            $departmentMembers = $members->where('department_id', $department->id);
                            $headstaffMembers = $departmentMembers->where('role', 'headstaff');
                            $regularMembers = $departmentMembers->where('role', '!=', 'headstaff');
                        @endphp
                        
                        @if($departmentMembers->count() > 0)
                            <h1 class="page-title slide-in sarabun-36">{{ $department->name }}</h1>
                            
                            <!-- Head Staff Section -->
                            @if($headstaffMembers->count() > 0)
                                <div class="cards-headstaff">
                                    @foreach($headstaffMembers as $member)
                                        <div class="card-wrapper-headstaff fade-in" data-department-id="{{ $member->department_id }}">
                                            <div class="card-container {{ !auth()->user()->canView($member) ? 'disabled-card' : '' }}">
                                                @if(auth()->user()->isAdmin())
                                                    <div class="card-edit" onclick="openEditPopup(this)" 
                                                        data-member-id="{{ $member->id }}">
                                                        <i class="fas fa-edit"></i>
                                                    </div>
                                                @endif
                                                @if(auth()->user()->canView($member))
                                                    <a href="{{ route('members.show', $member->id) }}">
                                                @endif
                                                    <div class="card-logo">
                                                        <img src="{{ $member->profile_picture ? Storage::url($member->profile_picture) : 'https://placehold.co/128' }}" 
                                                             class="card-logo-img" alt="logo">
                                                    </div>
                                                    <hr class="divider">
                                                    <div class="card-container-info">
                                                        <div class="card-name sarabun-20">
                                                            {{ $member->first_name }} {{ $member->last_name }}
                                                        </div>
                                                        <div class="card-description sarabun-16">
                                                            <p><b>ตำแหน่งงาน</b> {{ $member->position }}</p>
                                                            <p><b>หน่วยงาน</b> {{ $member->department->name }}</p>
                                                        </div>
                                                    </div>
                                                @if(auth()->user()->canView($member))
                                                    </a>
                                                @endif
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                                @if($regularMembers->count() > 0)
                                    <div class="divider-white"></div>
                                @endif
                            @endif

                            <!-- Regular Staff Section -->
                            <!-- <h2 class="sarabun-24">บุคลากร</h2> -->
                            <div class="cards-member">
                                @foreach($regularMembers as $member)
                                    <div class="card-wrapper fade-in" data-department-id="{{ $member->department_id }}">
                                        <div class="card-container {{ !auth()->user()->canView($member) ? 'disabled-card' : '' }}">
                                            @if(auth()->user()->isAdmin() || 
                                                (auth()->user()->isHeadstaff() && $member->department_id === auth()->user()->department_id))
                                                <div class="card-edit" onclick="openEditPopup(this)" 
                                                    data-member-id="{{ $member->id }}">
                                                    <i class="fas fa-edit"></i>
                                                </div>
                                            @endif
                                            @if(auth()->user()->canView($member))
                                                <a href="{{ route('members.show', $member->id) }}">
                                            @endif
                                                <div class="card-logo">
                                                    <img src="{{ $member->profile_picture ? Storage::url($member->profile_picture) : 'https://placehold.co/128' }}" 
                                                         class="card-logo-img" alt="logo">
                                                </div>
                                                <hr class="divider">
                                                <div class="card-container-info">
                                                    <div class="card-name sarabun-20">
                                                        {{ $member->first_name }} {{ $member->last_name }}
                                                    </div>
                                                    <div class="card-description sarabun-16">
                                                        <p><b>ตำแหน่งงาน</b> {{ $member->position }}</p>
                                                        <p><b>หน่วยงาน</b> {{ $member->department->name }}</p>
                                                    </div>
                                                </div>
                                            @if(auth()->user()->canView($member))
                                                </a>
                                            @endif
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    @endforeach
                </div>

                <!-- Individual department sections -->
                @foreach($departments as $department)
                    <div class="department-section" data-department="{{ $department->id }}" style="display: none;">
                        <h1 class="page-title slide-in sarabun-36">{{ $department->name }}</h1>
                        
                        <!-- Head Staff Section -->
                        @php
                            $headstaffMembers = $members->where('department_id', $department->id)
                                                  ->where('role', 'headstaff');
                            $regularMembers = $members->where('department_id', $department->id)
                                                  ->where('role', '!=', 'headstaff');
                        @endphp
                        @if($headstaffMembers->count() > 0)
                            <h2 class="sarabun-24">หัวหน้างาน</h2>
                            <div class="cards-member">
                                @foreach($headstaffMembers as $member)
                                    <div class="card-wrapper fade-in">
                                        <div class="card-container {{ !auth()->user()->canView($member) ? 'disabled-card' : '' }}">
                                            @if(auth()->user()->isAdmin())
                                                <div class="card-edit" onclick="event.stopPropagation(); openEditPopup(this)" 
                                                    data-member-id="{{ $member->id }}">
                                                    <i class="fas fa-edit"></i>
                                                </div>
                                            @endif
                                            @if(auth()->user()->canView($member))
                                                <a href="{{ route('members.show', $member->id) }}">
                                            @endif
                                                <div class="card-logo">
                                                    <img src="{{ $member->profile_picture ? Storage::url($member->profile_picture) : 'https://placehold.co/128' }}" 
                                                         class="card-logo-img" alt="logo">
                                                </div>
                                                <hr class="divider">
                                                <div class="card-container-info">
                                                    <div class="card-name sarabun-20">
                                                        {{ $member->first_name }} {{ $member->last_name }}
                                                    </div>
                                                    <div class="card-description sarabun-16">
                                                        <p><b>ตำแหน่งงาน</b> {{ $member->position }}</p>
                                                        <p><b>หน่วยงาน</b> {{ $member->department->name }}</p>
                                                    </div>
                                                </div>
                                            @if(auth()->user()->canView($member))
                                                </a>
                                            @endif
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                            @if($regularMembers->count() > 0)
                                <div class="divider-white"></div>
                            @endif
                        @endif

                        <!-- Regular Staff Section -->
                        <h2 class="sarabun-24">บุคลากร</h2>
                        <div class="cards-member">
                            @foreach($members->where('department_id', $department->id)->where('role', '!=', 'headstaff') as $member)
                                <div class="card-wrapper fade-in">
                                    <div class="card-container {{ !auth()->user()->canView($member) ? 'disabled-card' : '' }}">
                                        @if(auth()->user()->isAdmin() || 
                                            (auth()->user()->isHeadstaff() && $member->department_id === auth()->user()->department_id))
                                            <div class="card-edit" onclick="event.stopPropagation(); openEditPopup(this)" 
                                                data-member-id="{{ $member->id }}">
                                                <i class="fas fa-edit"></i>
                                            </div>
                                        @endif
                                        
                                        @if(auth()->user()->canView($member))
                                            <a href="{{ route('members.show', $member->id) }}">
                                        @endif
                                            <div class="card-logo">
                                                <img src="{{ $member->profile_picture ? Storage::url($member->profile_picture) : 'https://placehold.co/128' }}" 
                                                     class="card-logo-img" alt="logo">
                                            </div>
                                            <hr class="divider">
                                            <div class="card-container-info">
                                                <div class="card-name sarabun-20">
                                                    {{ $member->first_name }} {{ $member->last_name }}
                                                </div>
                                                <div class="card-description sarabun-16">
                                                    <p><b>ตำแหน่งงาน</b> {{ $member->position }}</p>
                                                    <p><b>หน่วยงาน</b> {{ $member->department->name }}</p>
                                                </div>
                                            </div>
                                        @if(auth()->user()->canView($member))
                                            </a>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </section>

    <!-- popup create new member-->
    <div id="createPopup" class="popup-container">
        <div class="create-popup-department">
            <div class="popup-content">
                <form id="createMemberForm" enctype="multipart/form-data" onsubmit="event.preventDefault(); createMember(event);">
                    @csrf
                    <div class="popup-header">
                        <div class="btn-close close-popup" onclick="closeCreatePopup()">
                            <   
                        </div>
                        <div class="popup-name">
                            <h1 class="popup-header-title sarabun-36">เพิ่มบุคลากร</h1>
                        </div>
                    </div>
                    <div class="popup-image">
                        <div class="card-logo-container">
                            <div class="card-logo" onclick="document.getElementById('memberProfilePicture').click()">
                                <img src="https://placehold.co/128" class="card-logo-img" id="previewImage" alt="logo">
                                <input type="file" name="profile_picture" id="memberProfilePicture" style="display: none;" accept="image/*">                                                    
                            </div>   
                            <div>
                                <i class="fas fa-camera"></i>
                                <span>อัพโหลดรูปภาพ</span>
                            </div> 
                        </div>                                                                
                    </div>
                    <div class="popup-input-container">
                        <div class="popup-member-name">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ชื่อ</h2>
                                <input type="text" name="first_name" placeholder="ชื่อ..." class="input-text sarabun-16" required>
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">นามสกุล</h2>
                                <input type="text" name="last_name" placeholder="นามสกุล..." class="input-text sarabun-16" required>
                            </div>
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">ตำแหน่ง</h2>
                            <input type="text" name="position" placeholder="ตำแหน่ง..." class="input-text sarabun-16" required>
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">หน่วยงาน</h2>
                            <select name="department_id" class="input-text sarabun-16" required>
                                <option value="">เลือกหน่วยงาน</option>
                                @foreach($departments as $department)
                                    <option value="{{ $department->id }}">{{ $department->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="popup-member-name">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">หน่วยงานย่อย</h2>
                                <input type="text" name="sub_department" placeholder="หน่วยงาน..." class="input-text sarabun-16">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">บทบาท</h2>
                                <select name="role" class="input-text sarabun-16" required>
                                    <option value="">เลือกบทบาท</option>
                                    <option value="admin">ผู้ดูแลระบบ</option>
                                    <option value="manager">ผู้บริหาร</option>
                                    <option value="headstaff">หัวหน้างาน</option>
                                    <option value="staff">บุคลากร</option>
                                </select>
                            </div>
                        </div>
                        <div class="popup-member-name">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">อีเมล</h2>
                                <input type="email" name="email" placeholder="อีเมล..." class="input-text sarabun-16">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">เบอร์โทรศัพท์</h2>
                                <input type="tel" 
                                       name="phone" 
                                       class="input-text phone-input sarabun-16" 
                                       placeholder="XXX-XXX-XXXX"
                                       maxlength="12">
                            </div>
                        </div>
                        <div class="popup-btn-wrapper">
                            <button type="button" class="btn btn-cancel sarabun-20" onclick="closeCreatePopup()">
                                ยกเลิก
                            </button>
                            <button type="button" class="btn btn-confirm sarabun-20" onclick="createMember(event)">
                                ตกลง
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- popup edit member-->
    <div id="popupEdit" class="popup-container">
        <div class="create-popup-department">
            <div class="popup-content">
                <form id="editMemberForm" enctype="multipart/form-data" onsubmit="event.preventDefault(); updateMember(event);">
                    @csrf
                    <input type="hidden" id="editMemberId" name="id">
                    <div class="popup-header">
                        <div class="btn-close close-popup" onclick="closeEditPopup()">
                            <   
                        </div>
                        <div class="popup-name">
                            <h1 class="popup-header-title sarabun-36">แก้ไขบุคลากร</h1>
                        </div>
                        <div class="popup-delete btn-pointer" onclick="openDeleteConfirmationPopup(this.closest('form').querySelector('#editMemberId').value)">    
                            <i class="fas fa-trash"></i>
                        </div>
                    </div>
                    <div class="popup-image">
                        <div class="card-logo-container">
                            <div class="card-logo" onclick="document.getElementById('editMemberProfilePicture').click()">
                                <img src="https://placehold.co/128" class="card-logo-img" id="editPreviewImage" alt="logo">
                                <input type="file" 
                                       name="profile_picture" 
                                       id="editMemberProfilePicture" 
                                       style="display: none;" 
                                       accept="image/*">
                            </div>
                            <div>
                                <i class="fas fa-camera"></i>
                                <span>อัพโหลดรูปภาพ</span>
                            </div> 
                        </div>
                        
                    </div>
                    <div class="popup-input-container">
                        <div class="popup-member-name">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">ชื่อ</h2>
                                <input type="text" name="first_name" placeholder="ชื่อ..." class="input-text">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">นามสกุล</h2>
                                <input type="text" name="last_name" placeholder="นามสกุล..." class="input-text">
                            </div>
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">ตำแหน่ง</h2>
                            <input type="text" name="position" placeholder="ตำแหน่ง..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">หน่วยงาน</h2>
                            <select name="department_id" class="input-text">
                                <option value="">เลือกหน่วยงาน</option>
                                @foreach($departments as $department)
                                    <option value="{{ $department->id }}">{{ $department->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="popup-member-name">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">หน่วยงานย่อย</h2>
                                <input type="text" name="sub_department" placeholder="หน่วยงาน..." class="input-text">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">บทบาท</h2>
                                <select name="role" class="input-text">
                                    <option value="">เลือกบทบาท</option>
                                    <option value="admin">ผู้ดูแลระบบ</option>
                                    <option value="manager">ผู้บริหาร</option>
                                    <option value="headstaff">หัวหน้างาน</option>
                                    <option value="staff">บุคลากร</option>
                                </select>
                            </div>
                        </div>
                        <div class="popup-member-name">
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">อีเมล</h2>
                                <input type="email" name="email" placeholder="อีเมล..." class="input-text">
                            </div>
                            <div class="popup-input-wrapper">
                                <h2 class="sarabun-16">เบอร์โทรศัพท์</h2>
                                <input type="tel" 
                                       name="phone" 
                                       class="input-text phone-input sarabun-16" 
                                       placeholder="XXX-XXX-XXXX"
                                       maxlength="12">
                            </div>
                        </div>
                        <div class="popup-btn-wrapper">
                            <button type="button" class="btn btn-cancel sarabun-20" onclick="closeEditPopup()">
                                ยกเลิก
                            </button>
                            <button type="button" class="btn btn-confirm sarabun-20" onclick="updateMember(event)">
                                ตกลง
                            </button>
                        </div>
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
                        <h1 class="popup-header-title sarabun-36">ต้องการลบบุคลากรนี้หรือไม่?</h1>
                    </div>
                </div>
                <div class = "card-logo">
                    <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                </div>  
                <div class="divider"></div>
                <div class = "card-name">
                    <h2 class="sarabun-36">ชื่อ - นามสกุล</h2>
                </div>
                <div class="popup-member-infoamation">
                    <div class="popup-member-infoamation-item">
                        <h2 class="sarabun-16">ตำแหน่ง</h2>
                        <p class="sarabun-16">ชื่อตำแหน่ง</p>
                    </div>
                </div>
                <div class="popup-member-infoamation">
                    <div class="popup-member-infoamation-item">
                        <h2 class="sarabun-16">หน่วยงาน</h2>
                        <p class="sarabun-16">ชื่อหน่วยงาน</p>
                    </div>
                </div>
                <div class="popup-member-infoamation">
                    <div class="popup-member-infoamation-item">
                        <h2 class="sarabun-16">หน่วยงานย่อย</h2>
                        <p class="sarabun-16">ชื่อหน่วยงานย่อย</p>
                    </div>
                </div>
                <div class="popup-member-infoamation">
                    <div class="popup-member-infoamation-item">
                        <h2 class="sarabun-16">อีเมล</h2>
                        <p class="sarabun-16">อีเมล</p>
                    </div>
                </div>
                <div class="popup-member-infoamation">
                    <div class="popup-member-infoamation-item">
                        <h2 class="sarabun-16">เบอร์โทรศัพท์</h2>
                        <p class="sarabun-16">เบอร์โทรศัพท์</p>
                    </div>
                </div>
                <div class="popup-btn-wrapper">
                    <button type="button" class="btn btn-cancel sarabun-20" onclick="closeDeleteConfirmation()">
                        ยกเลิก
                    </button>
                    <button type="button" class="btn btn-confirm sarabun-20" onclick="deleteMember()">
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Task Confirmation Popup -->
    <div id="taskConfirmationPopup" class="popup-container">
        <div class="confirmation-popup">
            <div class="popup-content">
                <div class="popup-header">
                    <div class="popup-name">
                        <h1 class="popup-header-title sarabun-36">ยืนยันการลบบุคลากรและภาระงาน</h1>
                    </div>
                </div>
                <div class="member-info">
                    <div class="card-logo">
                        <img id="memberImage" src="https://placehold.co/128" class="card-logo-img" alt="Member">
                    </div>
                    <h2 id="memberName" class="sarabun-24"></h2>
                </div>
                <div class="divider"></div>
                <div class="warning-message sarabun-20">
                    <i class="fas fa-exclamation-triangle"></i>
                    บุคลากรนี้มีภาระงานที่ต้องรับผิดชอบ การลบจะเป็นการลบภาระงานทั้งหมดด้วย
                </div>
                <div class="tasks-list" id="tasksList">
                    <!-- Tasks will be populated here -->
                </div>
                <div class="popup-btn-wrapper">
                    <button type="button" class="btn btn-cancel sarabun-20" onclick="closeTaskConfirmationPopup()">
                        ยกเลิก
                    </button>
                    <button type="button" class="btn btn-confirm sarabun-20" onclick="deleteMemberWithTasks()">
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- overlay -->
    <div id="overlay"></div>

    <!-- script -->
    @vite('resources/js/app.js')
    @vite('resources/js/member.js')
</body>
</html> 