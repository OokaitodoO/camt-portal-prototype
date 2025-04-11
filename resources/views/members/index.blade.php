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
            <div class="btn-create btn-text" id="popupButton">
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

        <!-- Member card -->
        <div class="content">
            @for($i = 0; $i < 2; $i++)
            <div class="department">
                <h1 class="page-title">หน่วยงาน</h1>
                <!-- leader -->
                <div class="card-leader">
                    <div class="card-container fade-in">
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
                                <p><b>หน่วยงาน</b> ชื่อหน่วยงานย่อย</p>
                            </div>
                        </div>
                        <hr class="divider">
                        <div class="card-container-contact">
                            <p>name_S@cmu.ac.th</p>
                            <p>0XX-XXX-XXXX</p>
                        </div>
                    </div>
                </div>

                <!-- members -->
                <div class="cards-member">
                    @for($j = 0; $j < 4; $j++)
                    <div class="card-wrapper">
                        <div class="card-container fade-in">
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
                                    <p><b>หน่วยงาน</b> ชื่อหน่วยงานย่อย</p>
                                </div>
                            </div>
                            <hr class="divider">
                            <div class="card-container-contact">
                                <p>name_S@cmu.ac.th</p>
                                <p>0XX-XXX-XXXX</p>
                            </div>
                        </div>
                    </div>
                    @endfor
                </div>
            </div>
            @endfor
        </div>
    </section>

    <!-- popup -->
    <div id="popup" class="popup-container">
        <div class="create-popup-department">
        </div>
    </div>

    <!-- overlay -->
    <div id="overlay"></div>

    <!-- script -->
    @vite('resources/js/app.js')
</body>
</html> 