<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>หน่วยงาน</title>

    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/department.css') }}">
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
                    <li><a href="{{route('departments.index')}}" class="btn-nav-active btn-text">หน่วยงาน</a></li>
                    <li><a href="{{ route('members.index') }}" class="btn-nav btn-text">บุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn-nav btn-text">ภาระงาน</a></li>
                </ul>
            </div>
            <div class="btn-create btn-text" id="popupButton">
                    <i class="fas fa-plus"></i> เพิ่มหน่วยงาน
            </div>
        </nav>
        <div class="search-tab">
            <div class="title slide-in">
                <h1 class="page-title">หน่วยงาน</h1>
            </div>
            <div class="search-bar">
                <input type="text" placeholder="ค้นหา">
            </div>
        </div>
    </header>

    <!-- department card -->
    <section class = "content-container">
        @for($i = 0; $i < 10; $i++)
            <div class = "card-container fade-in">
                <div class="card-edit">
                    <img src="https://placehold.co/30" alt="">
                </div>
                <div class = "card-logo">
                    <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                </div>    
                <hr class="divider">
                <div class = "card-name">
                    <h3>งานบริหารทั่วไป</h3>
                </div>
            </div>
        @endfor
    </section>

    <!-- popup create new department-->
    <div id="popup" class="popup-container">
        <div class="create-popup-department">
            <div class="popup-content">
                <div class="popup-header">
                    <div class="btn-close close-popup"> <!-- close button -->
                        <   
                    </div>
                    <div class="popup-name">
                        <h1 class="page-title">เพิ่มหน่วยงาน</h1>
                    </div>
                </div>
                <div class="popup-image">
                    <img src="https://placehold.co/128" alt="" class="card-logo-img">
                </div>
                <div class="popup-input-container">
                    <h2>ชื่อหน่วยงาน</h2>
                    <input type="text" placeholder="เพิ่มหน่วยงาน..." class="input-text-name">
                </div>
            </div>
            <div class="popup-btn-wrapper">
                <div class="btn btn-cancel close-popup">
                    <p>ยกเลิก</p>
                </div>
                <div class="btn btn-confirm" id="confirmButton">
                    <p>ตกลง</p>
                </div>
            </div>
        </div>
    </div>  
    
    <div id="overlay"></div>
    <!-- script -->
    @vite('resources/js/app.js')
</body>

</html>