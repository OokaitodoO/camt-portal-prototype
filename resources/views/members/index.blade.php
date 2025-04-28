<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เพิ่มบุคลากร</title>

    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/member.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="body-bg">
    <!-- Header -->
    <header>
        <div class="role-container">
            <ul>
                <li><a href="" class="btn-status btn-text sarabun-20">ตำแหน่ง</a></li>
            </ul>
        </div>
        <nav class="nav-bar">
            <div class="nav-bar-action-container">
            <img src="/Image/CamtLogo.png" alt="">
                <ul class="nav-action">
                    <li><a href="{{route('departments.index')}}" class="btn-nav btn-text sarabun-20">หน่วยงาน</a></li>
                    <li><a href="{{ route('members.index') }}" class="btn-nav-active btn-text sarabun-20">บุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav btn-text sarabun-20">ภาระงาน</a></li>
                </ul>
            </div>
            <div class="btn-create btn-text sarabun-20" id="popupButton" onclick="openCreatePopup()">
                    <i class="fas fa-plus"></i> เพิ่มบุคลากร
            </div>
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
                <!-- button --> 
                @for($i = 0; $i < 5; $i++)
                <div class="btn-side-nav">
                    <img src="https://placehold.co/25" class="nav-logo-img" alt="logo">
                    <div class="btn-side-nav-text sarabun-18">หน่วยงาน</div>
                </div>
                @endfor               
            </div> 
        </div>


        <div class="content">
            <div class="department">
                <h1 class="page-title slide-in sarabun-36">หน่วยงาน</h1>
                
                <!-- leader -->
                <div class="card-leader">
                    <div class="card-container fade-in">
                        <!-- Add edit button -->
                        <div class="card-edit" onclick="openEditPopup()">
                            <i class="fas fa-edit"></i>
                        </div>
                        
                        <a href="{{ route('members.show', 1) }}">
                            <div class="card-logo">
                                <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                            </div>
                            <hr class="divider">
                            <div class="card-container-info">
                                <div class="card-name sarabun-20">
                                    ชื่อ - นามสกุล
                                </div>
                                <div class="card-description sarabun-16">
                                    <p><b>ตำแหน่งงาน</b> ชื่อตำแหน่งงาน</p>
                                    <p><b>หน่วยงาน</b> ชื่อหน่วยงาน</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- members -->
                <div class="cards-member">
                    <div class="card-wrapper">
                        <div class="card-container fade-in">
                            <!-- Add edit button -->
                            <div class="card-edit" onclick="openEditPopup()">
                                <i class="fas fa-edit"></i>
                            </div>
                            
                            <a href="{{ route('members.show', 1) }}">
                                <div class="card-logo">
                                    <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                                </div>
                                <hr class="divider">
                                <div class="card-container-info">
                                    <div class="card-name sarabun-20">
                                        ชื่อ - นามสกุล
                                    </div>
                                    <div class="card-description sarabun-16">
                                        <p><b>ตำแหน่งงาน</b> ชื่อตำแหน่งงาน</p>
                                        <p><b>หน่วยงาน</b> ชื่อหน่วยงาน</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- popup create new member-->
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
                    <div class="popup-member-name">
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">ชื่อ</h2>
                            <input type="text" placeholder="ชื่อ..." class="input-text sarabun-16">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">นามสกุล</h2>
                            <input type="text" placeholder="นามสกุล..." class="input-text sarabun-16">
                        </div>
                    </div>
                    <div class="popup-input-wrapper">
                        <h2 class="sarabun-16">ตำแหน่ง</h2>
                        <input type="text" placeholder="ตำแหน่ง..." class="input-text sarabun-16">
                    </div>
                    <div class="popup-input-wrapper">
                        <h2 class="sarabun-16">หน่วยงาน</h2>
                        <div class="dropdown">
                            <div class="dropdown-btn" onclick="toggleDropdownDepartment('dropdownMenuDepartmentCreate')">
                                <span class="selected-text sarabun-16">เลือกหน่วยงาน</span>
                                <button>▼</button>
                            </div>
                            <div class="dropdown-content sarabun-16" id="dropdownMenuDepartmentCreate">
                                <a href="#" onclick="selectDepartment(this, 'dropdownMenuDepartmentCreate')">หน่วยงาน 1</a>
                                <a href="#" onclick="selectDepartment(this, 'dropdownMenuDepartmentCreate')">หน่วยงาน 2</a>
                                <a href="#" onclick="selectDepartment(this, 'dropdownMenuDepartmentCreate')">หน่วยงาน 3</a>
                            </div>
                        </div>
                    </div>
                    <div class="popup-member-name">
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">หน่วยงานย่อย</h2>
                            <input type="text" placeholder="หน่วยงาน..." class="input-text sarabun-16">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">บทบาท</h2>
                            <div class="dropdown">
                                <div class="dropdown-btn" onclick="toggleDropdownDepartment('dropdownMenuRoleCreate')">
                                    <span class="selected-text sarabun-16">เลือกบทบาท</span>
                                    <button>▼</button>
                                </div>
                                <div class="dropdown-content sarabun-16" id="dropdownMenuRoleCreate">
                                    <a href="#" onclick="selectRole(this, 'dropdownMenuRoleCreate')">ผู้ดูแลระบบ</a>
                                    <a href="#" onclick="selectRole(this, 'dropdownMenuRoleCreate')">ผู้บริหาร</a>
                                    <a href="#" onclick="selectRole(this, 'dropdownMenuRoleCreate')">หัวหน้างาน</a>
                                    <a href="#" onclick="selectRole(this, 'dropdownMenuRoleCreate')">บุคลากร</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="popup-member-name">
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">อีเมล</h2>
                            <input type="text" placeholder="อีเมล..." class="input-text sarabun-16">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">เบอร์โทรศัพท์</h2>
                            <input type="text" placeholder="เบอร์โทรศัพท์..." class="input-text sarabun-16">
                        </div>
                    </div>
                    <div class="popup-btn-wrapper">
                        <div class="btn btn-cancel close-popup" onclick="closeCreatePopup()">
                            <p class="sarabun-20">ยกเลิก</p>
                        </div>
                        <div class="btn btn-confirm" id="confirmButton" onclick="createNewMember()">
                            <p class="sarabun-20">ตกลง</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- popup edit member-->
    <div id="popupEdit" class="popup-container">
        <div class="create-popup-department">
            <div class="popup-content">
                <div class="popup-header">
                    <div class="btn-close close-popup" onclick="closeEditPopup()"> <!-- close button -->
                        <   
                    </div>
                    <div class="popup-name">
                        <h1 class="page-title">แก้ไขบุคลากร</h1>
                    </div>
                    <div class="popup-delete btn-pointer" onclick="openDeleteConfirmationPopup()">    
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
                <div class="popup-image">
                    <img src="https://placehold.co/128" alt="" class="card-logo-img">
                </div>
                <div class="popup-input-container">
                    <div class="popup-member-name">
                        <div class="popup-input-wrapper">
                            <h2>ชื่อ</h2>
                            <input type="text" placeholder="ชื่อ..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2>นามสกุล</h2>
                            <input type="text" placeholder="นามสกุล..." class="input-text">
                        </div>
                    </div>
                    <div class="popup-input-wrapper">
                        <h2>ตำแหน่ง</h2>
                        <input type="text" placeholder="ตำแหน่ง..." class="input-text">
                    </div>
                    <div class="popup-input-wrapper">
                        <h2>หน่วยงาน</h2>
                        <div class="dropdown">
                            <div class="dropdown-btn" onclick="toggleDropdownDepartment('dropdownMenuDepartmentEdit')">
                                <span class="selected-text">เลือกหน่วยงาน</span>
                                <button>▼</button>
                            </div>
                            <div class="dropdown-content" id="dropdownMenuDepartmentEdit">
                                <a href="#" onclick="selectDepartment(this, 'dropdownMenuDepartmentEdit')">หน่วยงาน 1</a>
                                <a href="#" onclick="selectDepartment(this, 'dropdownMenuDepartmentEdit')">หน่วยงาน 2</a>
                                <a href="#" onclick="selectDepartment(this, 'dropdownMenuDepartmentEdit')">หน่วยงาน 3</a>
                            </div>
                        </div>
                    </div>
                    <div class="popup-member-name">
                        <div class="popup-input-wrapper">
                            <h2>หน่วยงานย่อย</h2>
                            <input type="text" placeholder="หน่วยงาน..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2>บทบาท</h2>
                            <div class="dropdown">
                                <div class="dropdown-btn" onclick="toggleDropdownDepartment('dropdownMenuRoleEdit')">
                                    <span class="selected-text">เลือกบทบาท</span>
                                    <button>▼</button>
                                </div>
                                <div class="dropdown-content" id="dropdownMenuRoleEdit">
                                    <a href="#" onclick="selectRole(this, 'dropdownMenuRoleEdit')">ผู้ดูแลระบบ</a>
                                    <a href="#" onclick="selectRole(this, 'dropdownMenuRoleEdit')">ผู้บริหาร</a>
                                    <a href="#" onclick="selectRole(this, 'dropdownMenuRoleEdit')">หัวหน้างาน</a>
                                    <a href="#" onclick="selectRole(this, 'dropdownMenuRoleEdit')">บุคลากร</a>
                                </div>
                            </div>
                        </div>
                    </div>                    
                    <div class="popup-member-name">
                        <div class="popup-input-wrapper">
                            <h2>อีเมล</h2>
                            <input type="text" placeholder="อีเมล..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2 class="sarabun-16">เบอร์โทรศัพท์</h2>
                            <input type="text" placeholder="เบอร์โทรศัพท์..." class="input-text sarabun-16">
                        </div>
                    </div>
                    <div class="popup-btn-wrapper">
                        <div class="btn btn-cancel close-popup" onclick="closeEditPopup()">
                            <p class="sarabun-20">ยกเลิก</p>
                        </div>
                        <div class="btn btn-confirm" id="confirmButton" onclick="closeEditPopup()">
                            <p class="sarabun-20">ตกลง</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Popup -->
    <div id="deleteConfirmationPopup" class="popup-container">
        <div class="confirmation-popup scale-in">
            <div class="popup-content">
                <div class="popup-header">
                    <div class="popup-name">
                        <h1 class="page-title sarabun-36">ต้องการลบบุคลากรนี้หรือไม่?</h1>
                    </div>
                </div>
                <div class = "card-logo">
                    <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                </div>  
                <div class="divider"></div>
                <div class = "card-name sarabun-36">
                    <h2>ชื่อ - นามสกุล</h2>
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
                    <div class="btn btn-cancel" onclick="closeDeleteConfirmation()">
                        <p class="sarabun-20">ยกเลิก</p>
                    </div>
                    <div class="btn btn-confirm" onclick="deleteMember()">
                        <p class="sarabun-20">ยืนยัน</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- overlay -->
    <div id="overlay"></div>

    <!-- script -->
    @vite('resources/js/app.js')
</body>
</html> 