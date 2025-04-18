<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เพิ่มบุคลากร</title>

    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <!-- <link rel="stylesheet" href="{{ asset('css/department.css') }}"> -->
    <link rel="stylesheet" href="{{ asset('css/pages/member.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="body-bg">
    <!-- Header -->
    <header>
        <div class="role-container">
            <ul>
                <li><a href="" class="btn-status btn-text">ตำแหน่ง</a></li>
            </ul>
        </div>
        <nav class="nav-bar">
            <div class="nav-bar-action-container">
            <img src="https://placehold.co/200x50" alt="">
                <ul class="nav-action">
                    <li><a href="{{route('departments.index')}}" class="btn-nav btn-text">หน่วยงาน</a></li>
                    <li><a href="{{ route('members.index') }}" class="btn-nav-active btn-text">บุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav btn-text">ภาระงาน</a></li>
                </ul>
            </div>
            <div class="btn-create btn-text" id="popupButton" onclick="openCreatePopup()">
                    <i class="fas fa-plus"></i> เพิ่มบุคลากร
            </div>
        </nav>
        <div class="search-tab">
            <div class="title slide-in">
                <h1 class="page-title">บุคลากร</h1>
            </div>
            <div class="search-bar">
                <input type="text" placeholder="ค้นหา">
            </div>
        </div>
    </header>

    <!-- Content -->
    <section class="content-container">
        <div class="content">
            <div class="department">
                <h1 class="page-title slide-in">หน่วยงาน</h1>
                
                <!-- leader -->
                <div class="card-leader">
                    <a href="{{ route('members.show', 1) }}" class="card-container fade-in">
                        <div class="card-logo">
                            <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                        </div>
                        <hr class="divider">
                        <div class="card-container-info">
                            <div class="card-name">
                                ชื่อ - นามสกุล
                            </div>
                            <div class="card-description">
                                <p><b>ตำแหน่งงาน</b> ชื่อตำแหน่งงาน</p>
                                <p><b>หน่วยงาน</b> ชื่อหน่วยงาน</p>
                            </div>
                        </div>
                        <hr class="divider">
                        <div class="card-container-contact">
                            <p>name_S@cmu.ac.th</p>
                            <p>0XX-XXX-XXXX</p>
                        </div>
                    </a>
                </div>

                <!-- members -->
                <div class="cards-member">
                    <div class="card-wrapper">
                        <a href="{{ route('members.show', 1) }}" class="card-container fade-in">
                            <div class="card-logo">
                                <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                            </div>
                            <hr class="divider">
                            <div class="card-container-info">
                                <div class="card-name">
                                    ชื่อ - นามสกุล
                                </div>
                                <div class="card-description">
                                    <p><b>ตำแหน่งงาน</b> ชื่อตำแหน่งงาน</p>
                                    <p><b>หน่วยงาน</b> ชื่อหน่วยงาน</p>
                                </div>
                            </div>
                            <hr class="divider">
                            <div class="card-container-contact">
                                <p>name_S@cmu.ac.th</p>
                                <p>0XX-XXX-XXXX</p>
                            </div>
                        </a>
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
                        <h1 class="page-title">เพิ่มบุคลากร</h1>
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
                            <div class="dropdown-btn" onclick="toggleDropdownDepartment()">
                                <span class="selected-text">เลือกหน่วยงาน</span>
                                <button>▼</button>
                            </div>
                            <div class="dropdown-content" id="dropdownMenuDepartment">
                                <a href="#" onclick="selectDepartment(this)">หน่วยงาน 1</a>
                                <a href="#" onclick="selectDepartment(this)">หน่วยงาน 2</a>
                                <a href="#" onclick="selectDepartment(this)">หน่วยงาน 3</a>
                            </div>
                        </div>
                    </div>
                    <div class="popup-input-wrapper">
                        <h2>หน่วยงานย่อย</h2>
                        <input type="text" placeholder="หน่วยงาน..." class="input-text">
                    </div>
                    <div class="popup-member-name">
                        <div class="popup-input-wrapper">
                            <h2>อีเมล</h2>
                            <input type="text" placeholder="อีเมล..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2>เบอร์โทรศัพท์</h2>
                            <input type="text" placeholder="เบอร์โทรศัพท์..." class="input-text">
                        </div>
                    </div>
                    <div class="popup-btn-wrapper">
                        <div class="btn btn-cancel close-popup" onclick="closeCreatePopup()">
                            <p>ยกเลิก</p>
                        </div>
                        <div class="btn btn-confirm" id="confirmButton" onclick="createNewMember()">
                            <p>ตกลง</p>
                        </div>
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