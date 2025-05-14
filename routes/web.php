<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\TaskController;

// Public routes
Route::get('/', [LoginController::class, 'index'])->name('home');
Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Protected routes
Route::middleware(['auth'])->group(function () {
    // Department routes
    Route::get('/department', [DepartmentController::class, 'index'])->name('department');
    Route::post('/departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::post('/departments/{id}/update', [DepartmentController::class, 'update'])->name('departments.update');
    Route::get('/departments/{id}/data', [DepartmentController::class, 'getDepartmentData'])->name('departments.getData');
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');

    // Member routes
    Route::get('/member', [MemberController::class, 'index'])->name('member');
    Route::get('/members', [MemberController::class, 'index'])->name('members.index');
    Route::get('/members/filter/{department}', [MemberController::class, 'filterByDepartment'])->name('members.filter');
    Route::get('/members/create', [MemberController::class, 'create'])->name('members.create');
    Route::get('/members/{member}', [MemberController::class, 'show'])->name('members.show');
    Route::get('/members/{member}/edit', [MemberController::class, 'edit'])->name('members.edit');
    Route::get('/members/search', [MemberController::class, 'search'])->name('members.search');
    Route::post('/members', [MemberController::class, 'store'])->name('members.store');
    Route::put('/members/{member}', [MemberController::class, 'update'])->name('members.update');
    Route::delete('/members/{member}', [MemberController::class, 'destroy'])->name('members.destroy');
    Route::get('/members/{member}/details', [MemberController::class, 'getMemberDetails'])->name('members.details');
    Route::get('/members/{member}/details-with-tasks', [MemberController::class, 'getDetailsWithTasks'])->name('members.getDetailsWithTasks');
    Route::get('/members/{member}/data', [MemberController::class, 'getMemberData'])->name('members.getData');
    Route::delete('/members/{member}/with-tasks', [MemberController::class, 'destroyWithTasks'])->name('members.destroyWithTasks');

    // Task routes
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index'])->name('tasks.index');
        Route::post('/', [TaskController::class, 'store'])->name('tasks.store');
        Route::get('/filter/{departmentId}', [TaskController::class, 'filterByDepartment'])->name('tasks.filter');
        Route::get('/department/{departmentId}/members', [TaskController::class, 'getDepartmentMembers'])->name('tasks.department.members');
        Route::put('/{task}', [TaskController::class, 'update'])->name('tasks.update');
        Route::delete('/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
        Route::get('/search-members', [TaskController::class, 'searchMembers'])->name('tasks.search-members');
        Route::get('/{task}/data', [TaskController::class, 'getData'])->name('tasks.getData');
        Route::get('/{task}/subtasks', [TaskController::class, 'getSubtasks'])->name('tasks.subtasks');
        Route::post('/{task}/toggle-favorite', [TaskController::class, 'toggleFavorite'])->name('tasks.toggle-favorite');
        Route::get('/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');
        Route::get('/{task}', [TaskController::class, 'show'])->name('tasks.show');
    });
});

// Remove these duplicate or unnecessary routes as they're already defined above
// Route::middleware(['auth', 'verified'])->group(function () { ... });
// Route::middleware(['auth', 'role:admin'])->group(function () { ... });
// Route::middleware(['auth', 'role:admin,manager'])->group(function () { ... });
// Route::get('/departments', function() { ... });
// Other duplicate routes...

