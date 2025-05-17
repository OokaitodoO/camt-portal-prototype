<div class="card-wrapper fade-in">
    <div class="card-container">
        @if(auth()->user()->isAdmin())
        <div class="card-edit" onclick="openEditPopup(this)" 
            data-department-id="{{ $department->id }}">
                <i class="fas fa-edit"></i>
            </div>
        @endif
        
        <div class="card-content" onclick="window.location.href='{{ route('members.filter', $department->id) }}'">
            <div class="card-logo">
                <img src="{{ $department->icon_path ? asset('storage/'.$department->icon_path) : asset('images/placeholder.png') }}" 
                     alt="{{ $department->name }}" 
                     class="card-logo-img"
                     onerror="this.src='https://placehold.co/128'">
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