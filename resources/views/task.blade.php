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
                    <li><a href="{{ route('members.index') }}" class="btn-nav btn-text">บุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav-active btn-text">ภาระงาน</a></li>
                </ul>
            </div>
            <div id="popupButton" class="btn-create btn-text" onclick="openCreatePopup()">
                    <i class="fas fa-plus"></i> เพิ่มภาระงาน
            </div>
        </nav>
        <div class="search-tab">
            <div class="title slide-in">
                <h1 class="page-title">ภาระงาน</h1>
            </div>
            <div class="search-bar">
                <input type="text" placeholder="ค้นหา">
            </div>
        </div>
    </header>

    <!-- Content -->
    <section class="content-container">

        <div class="side-nav-container slide-right">
            <div class="side-nav">
                <h3>หน่วยงานทั้งหมด</h3>   
                <!-- button --> 
                @for($i = 0; $i < 5; $i++)
                <div class="btn-side-nav">
                    <img src="https://placehold.co/25" class="nav-logo-img" alt="logo">
                    <div class="btn-side-nav-text">
                        หน่วยงาน
                    </div>
                </div>
                @endfor               
            </div> 
        </div>

        <!-- task table -->
        <div class="content">
            <div class="task-remain slide-in">
                <h3>จำนวนภาระงาน</h3>
                <p>XX</p>
            </div>

            <!-- task table -->
            @for($x = 0; $x < 3 ; $x++)
            <div class="task-department">
                <h1 class="page-title slide-in">หน่วยงาน</h1>
                <table class="fade-in">
                    <tr class="table-title">
                        <th>ภาระงาน</th>
                        <th>หน่วยงาน</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>มอบหมายโดย</th>
                        <th>วันครบกำหนด</th>
                        <th>แก้ไข</th>
                    </tr>
                    @for($i = 0; $i < 5 ; $i++)
                    <tr class="table-task">
                        <td class="border-top">ภาระงาน</td>
                        <td class="border-top">ชื่อหน่วยงาน</td>
                        <td class="border-top">ชื่อบุคลากร</td>
                        <td class="border-top">ชื่อบุคลากร</td>
                        <td class="border-top">วันครบกำหนด</td>
                        <td class="border-top"><a href="">Q</a></td>
                    </tr>
                    @endfor
                </table>
            </div>
            @endfor
        </div>

        <!-- popup create new task -->
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
    </div>
        
        <div id="overlay"></div>

        <!-- script -->
        @vite('resources/js/app.js')
        
    </section>
</body>
</html>