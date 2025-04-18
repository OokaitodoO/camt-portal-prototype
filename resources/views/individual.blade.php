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
        <div class="side-nav-container">
            <div class="side-nav-logo">
                <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
            </div>
            <div class="divider"></div>
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
                <div class="divider"></div>
                <div class="side-nav-info-item">
                    <h2>อีเมล</h2>
                    <p>....@cmu.ac.th</p>
                </div>
                <div class="side-nav-info-item">
                    <h2>เบอร์โทร</h2>
                    <p>0XX-XXX-XXXX</p>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="content-task">
                <div class="card-wrapper">
                    <div class="card-container">
                        <div class="card-logo">
                            <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                        </div>
                        <div class="divider"></div>
                        <div class="card-container-info">
                            <div class="card-container-info-item">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </section>

    <!-- script -->
    @vite('resources/js/app.js')
</body>
</html>
