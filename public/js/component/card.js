export function createDepartmentCard(department) {
    return `
        <div class="card-container fade-in">
            <div class="card-edit" onclick="openEditPopup(this)" data-department="${department.name}">
                <i class="fas fa-edit"></i>
            </div>
            <div class="card-logo">
                <img src="${department.icon_path || 'https://placehold.co/128'}" class="card-logo-img" alt="logo">
            </div>    
            <hr class="divider">
            <div class="card-name sarabun-20">
                <h3>${department.name}</h3>
            </div>
        </div>
    `;
}
