<div class="card-wrapper">
    <div class="card-container">
        <div class="card-edit" onclick="openEditPopup(this)" 
            data-department-id="{{ $department->id }}">
            <i class="fas fa-edit"></i>
        </div>
        
        <div class="card-content" onclick="window.location.href='{{ route('members.filter', $department->id) }}'">
            <div class="card-logo">
                <img src="{{ $department->icon_path ?? 'https://placehold.co/128' }}" class="card-logo-img" alt="logo" id="department-logo-{{ $department->id }}">
            </div>
            <hr class="divider">
            <div class="card-container-info">
                <div class="card-name sarabun-20">
                    <h3>{{ $department->name }}</h3>
                </div>                
            </div>
        </div>
    </div>
</div> 