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
                    <i class="fas fa-plus"></i> เพิ่มเนื้อหา
            </div>
        </nav>
        <div class="search-tab">
            <div class="title slide-in">
                <h1 class="page-title">ข้อมูลบุคลากร</h1>
            </div>
        </div>
    </header>

    <!-- Individual Member Content -->
    <section class="content-container">
        <!-- side nav -->
        <div class="side-nav-container slide-right">
            <div class="side-nav-logo">
                <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
            </div>
            <div class="side-nav-info-item">
                    <div class="divider"></div>
            </div>
            <div class="side-nav-info">
                <div class="side-nav-info-name">
                    <h2>ชื่อ - นามสกุล</h2>
                </div>   
                <div class="side-nav-info-item">
                    <h2>ตำแหน่งงาน</h2>
                </div>         
                <div class="side-nav-info-item">
                    <h2>หน่วยงาน</h2>
                </div>
                <div class="side-nav-info-item">
                    <h2>หน่วยงานย่อย</h2>
                </div>
                <div class="side-nav-info-item">
                    <h2>บทบาท</h2>
                </div>
                <div class="side-nav-info-item">
                    <div class="divider"></div>
                </div>
                <div class="side-nav-info-item">
                    <h2>อีเมล</h2>
                    <p>....@cmu.ac.th</p>
                </div>
                <div class="side-nav-info-item">
                    <h2>เบอร์โทร</h2>
                    <p>0XX-XXX-XXXX</p>
                </div>
                <div class="side-nav-info-item">
                    <div class="divider"></div>
                </div>
            </div>
            <div class="side-nav-pin">
                <h3>ภาระงานที่ใช้บ่อย</h3>
                <div class="btn-side-nav">
                    <img src="https://placehold.co/25" class="nav-logo-img" alt="logo">
                    <div class="btn-side-nav-text">
                        หน่วยงาน
                    </div>
                </div> 
            </div>  
        </div>
        

        <!-- content -->
        <div class="content">
            <div class="content-task">
                @for($i = 0; $i < 5; $i++)
                <div class="card-wrapper fade-in">
                    <div class="card-container">
                        <div class="card-logo">
                            <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                        </div>
                        <div class="divider"></div>
                        <div class="card-container-info">
                            <div class="card-container-info-item">
                                <div class="card-name">
                                    <h3>ภาระงาน</h3> 
                                </div>
                            </div>
                            <div class="card-container-info-item">
                                <div class="card-details">
                                    <p>รายละเอียด</p>
                                </div>
                                <div class="card-details">
                                    <p class="card-date-title">วันครบกำหนด</p>
                                    <p>ไม่มีกำหนด</p>
                                </div>
                            </div>
                            <div class="card-container-info-item">

                            </div>
                        </div>
                    </div>
                </div>
                @endfor
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
                            <h1 class="page-title">เพิ่มบุคลากร</h1>
                        </div>
                    </div>
                    <div class="popup-image">
                        <img src="https://placehold.co/128" alt="" class="card-logo-img">
                    </div>
                    <div class="popup-input-container">
                        <div class="popup-input-wrapper">
                            <h2>ชื่อภาระงาน</h2>
                            <input type="text" placeholder="ภาระงาน..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2>รายละเอียด</h2>
                            <input type="text" placeholder="รายละเอียด..." class="input-text">
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
                            <h2>ลิ้งก์</h2>
                            <input type="text" placeholder="ลิ้งก์..." class="input-text">
                        </div>
                        <div class="popup-input-wrapper">
                            <h2>มอบหมายภาระงานให้</h2>
                            <div class="dropdown">
                                <div class="dropdown-btn" onclick="toggleDropdownMember()">
                                    <span class="selected-text">เลือกบุคลากร</span>
                                    <button>▼</button>
                                </div>
                                <div class="dropdown-content" id="dropdownMenuMember">
                                    <a href="#" onclick="selectMember(this)">บุคลากร 1</a>
                                    <a href="#" onclick="selectMember(this)">บุคลากร 2</a>
                                    <a href="#" onclick="selectMember(this)">บุคลากร 3</a>
                                </div>
                            </div>
                        </div>
                        <div class="popup-input-wrapper">
                            <div class="date-picker">
                                <h2>วันครบกำหนด</h2>
                                <input type="date" id="deadline" name="deadline">
                            </div>
                        </div>
                    </div>
                    <hr class="divider">
                    <div class="popup-sub-task-wrapper">
                        <div class="popup-sub-task">
                            <div class="popup-sub-task-detail">
                                <div class="popup-input-wrapper">
                                    <h2>ภาระงานย่อย 1</h2>
                                    <input type="text" placeholder="ภาระงาน..." class="input-text">
                                </div>
                                <div class="popup-input-wrapper">
                                    <h2>ลิ้งก์</h2>
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
                            <p>ยกเลิก</p>
                        </div>
                        <div class="btn btn-confirm" id="confirmButton" onclick="createNewTask()">
                            <p>ตกลง</p>
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
