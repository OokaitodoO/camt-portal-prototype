<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>หน่วยงาน</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/department.css') }}">
    <!-- Add Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
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
                <img src="{{ asset('images/CamtLogo.png') }}" alt="Logo" onerror="this.src='https://placehold.co/200x60'">
                <ul class="nav-action">
                    <li><a href="{{route('department')}}" class="btn-nav-active btn-text sarabun-20">หน่วยงาน</a></li>
                    <li><a href="{{ route('members.index') }}" class="btn-nav btn-text sarabun-20">บุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav btn-text sarabun-20">ภาระงาน</a></li>
                </ul>
            </div>
            <div class="btn-create btn-text sarabun-20" id="popupButton" onclick="openCreatePopup()">
                    <i class="fas fa-plus"></i> เพิ่มหน่วยงาน
            </div>
        </nav>
        <div class="search-tab">
            <div class="title slide-in sarabun-36">
                <h1 class="page-title">หน่วยงาน</h1>
            </div>
            <div class="search-bar ">
                <input type="text" placeholder="ค้นหา" class="sarabun-16">
            </div>
        </div>
    </header>

    <!-- department card -->
    <section class="content-container">        
        @foreach($departments as $department)
            @include('components.department-card', ['department' => $department])
        @endforeach
    </section>

    <!-- popup create new department-->
    <div id="popupCreate" class="popup-container">
        <div class="create-popup-department">
            <div class="popup-content">
                <form id="createDepartmentForm">
                    <div class="popup-header">
                        <div class="btn-close close-popup" onclick="closeCreatePopup()">
                            <   
                        </div>
                        <div class="popup-name">
                            <h1 class="page-title sarabun-36">เพิ่มหน่วยงาน</h1>
                        </div>
                    </div>
                    <div class="popup-image">
                        <label for="departmentLogo" class="logo-upload-label">
                            <img src="https://placehold.co/128" alt="" class="card-logo-img" id="createLogoPreview">
                            <div class="upload-overlay">
                                <i class="fas fa-camera"></i>
                                <span>อัพโหลดรูปภาพ</span>
                            </div>
                        </label>
                        <input type="file" name="icon" id="departmentLogo" accept="image/*" style="display: none;">
                    </div>
                    <div class="popup-input-container sarabun-24">
                        <h2>ชื่อหน่วยงาน</h2>
                        <input type="text" name="name" placeholder="เพิ่มหน่วยงาน..." class="input-text-name sarabun-16">
                    </div>
                    <div class="popup-btn-wrapper">
                        <div class="btn btn-cancel close-popup sarabun-20" onclick="closeCreatePopup()">
                            <p>ยกเลิก</p>
                        </div>
                        <button type="submit" class="btn btn-confirm sarabun-20">
                            <p>ตกลง</p>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>  

    <!-- popup edit department -->
    <div id="popupEdit" class="popup-container">
        <div class="create-popup-department">
            <div class="popup-content">
                <form id="editDepartmentForm">
                    <div class="popup-header">
                        <div class="btn-close close-popup" onclick="closeEditPopup()">
                            <
                        </div>
                        <div class="popup-name">
                            <h1 class="page-title sarabun-36">แก้ไขหน่วยงาน</h1>
                        </div>
                        <div class="popup-delete btn-pointer" onclick="openDeleteConfirmationPopup()">
                            <i class="fas fa-trash"></i>
                        </div>
                    </div>
                    <input type="hidden" name="id" id="editDepartmentId">
                    <div class="popup-image">
                        <label for="editDepartmentLogo" class="logo-upload-label">
                            <img src="" alt="" class="card-logo-img" id="editLogoPreview">
                            <div class="upload-overlay">
                                <i class="fas fa-camera"></i>
                                <span>อัพโหลดรูปภาพ</span>
                            </div>
                        </label>
                        <input type="file" name="icon" id="editDepartmentLogo" accept="image/*" style="display: none;">
                    </div>
                    <div class="popup-input-container sarabun-24">
                        <h2>ชื่อหน่วยงาน</h2>
                        <input type="text" name="name" placeholder="เพิ่มหน่วยงาน..." class="input-text-name sarabun-16">
                    </div>
                    <div class="popup-btn-wrapper">
                        <div class="btn btn-cancel close-popup sarabun-20" onclick="closeEditPopup()">
                            <p>ยกเลิก</p>
                        </div>
                        <button type="submit" class="btn btn-confirm sarabun-20">
                            <p>ตกลง</p>
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
                        <h1 class="page-title sarabun-36">ต้องการลบหน่วยงานนี้หรือไม่?</h1>
                    </div>
                </div>
                <div class="card-logo">
                    <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                </div>  
                <div class="divider"></div>
                <div class="card-name sarabun-24">
                    <h3><!-- Department name will be inserted here --></h3>
                </div>
                <div class="popup-btn-wrapper">
                    <div class="btn btn-cancel sarabun-20" onclick="closeDeleteConfirmation()">
                        <p>ยกเลิก</p>
                    </div>
                    <div class="btn btn-confirm sarabun-20" onclick="deleteDepartment()">
                        <p>ยืนยัน</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="overlay"></div>

    <!-- script -->
    @vite('resources/js/app.js')
    @vite('resources/js/department.js')

</body>

</html>