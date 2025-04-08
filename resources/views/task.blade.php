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
            <div class="btn-create btn-text">
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

    </section>
</body>
</html>