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
                <li><a href="" class="btn-orange">ตำแหน่ง</a></li>
            </ul>
        </div>
        <nav class="nav-bar">
            <div class="nav-bar-action-container">
            <img src="https://placehold.co/200x50" alt="">
                <ul class="nav-action">
                    <li><a href="{{route('departments.index')}}" class="btn active">หน่วยงาน</a></li>
                    <li><a href="{{ route('members.index') }}" class="btn">เพิ่มบุคลากร</a></li>
                    <li><a href="{{ route('tasks.index') }}" class="btn">ภาระงาน</a></li>
                </ul>
            </div>
            <button type="button" class="btn-orange create-nav-btn"">
                    <i class="fas fa-plus"></i> เพิ่มหน่วยงาน
            </button>
        </nav>
        <div class="search-bar">
            <div class="title slide-in">
                <h1><i class="fas"></i> หน่วยงาน</h1>
            </div>
            <div class="action-container">
                <input type="text" placeholder="ค้นหาหน่วยงาน...">
            </div>
        </div>
    </header>

    <!-- department card -->
    <section class = "content-container">
        @for($i = 0; $i < 10; $i++)
            <div class = "card-container fade-in">
                <div class = "card-logo">
                    <img src="https://placehold.co/128" class="card-logo-img" alt="logo">
                </div>      
                <div class = "card-name">
                    <h3>งานบริหารทั่วไป</h3>
                </div>
            </div>
        @endfor
    </section>

    

</body>
</html>