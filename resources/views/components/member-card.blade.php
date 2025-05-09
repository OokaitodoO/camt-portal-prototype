<div class="card-wrapper fade-in">
    <div class="card-container" data-member-id="{{ $member->id }}">
        <div class="card-edit" onclick="openEditPopup(this)" 
            data-member-id="{{ $member->id }}"
            data-first-name="{{ $member->first_name }}"
            data-last-name="{{ $member->last_name }}"
            data-position="{{ $member->position }}"
            data-department-id="{{ $member->department_id }}">
            <i class="fas fa-edit"></i>
        </div>
        
        <a href="{{ route('members.show', $member->id) }}" class="card-content">
            <div class="card-logo">
                <img src="{{ $member->profile_picture ?? 'https://placehold.co/128' }}" 
                     class="card-logo-img" 
                     alt="{{ $member->first_name }}'s profile picture">
            </div>
            <div class="divider"></div>
            <div class="card-container-info">
                <div class="card-container-info-item">
                    <div class="card-name">
                        <h3 class="sarabun-24">{{ $member->first_name }} {{ $member->last_name }}</h3>
                    </div>
                </div>
                <div class="card-container-info-item">
                    <div class="card-details">
                        <h2 class="sarabun-16">ตำแหน่ง</h2>
                        <p class="sarabun-16">{{ $member->position }}</p>
                    </div>
                    <div class="card-details">
                        <h2 class="sarabun-16">หน่วยงาน</h2>
                        <p class="sarabun-16">{{ $member->department->name }}</p>
                    </div>
                    @if($member->sub_department)
                        <div class="card-details">
                            <h2 class="sarabun-16">หน่วยงานย่อย</h2>
                            <p class="sarabun-16">{{ $member->sub_department }}</p>
                        </div>
                    @endif
                    <div class="card-details">
                        <h2 class="sarabun-16">บทบาท</h2>
                        <p class="sarabun-16">{{ $member->role }}</p>
                    </div>
                </div>
            </div>
        </a>
    </div>
</div> 