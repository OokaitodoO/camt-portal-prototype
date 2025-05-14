<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\TaskController;

Route::get('/', [LoginController::class, 'index'])->name('home');
Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Add middleware to protect routes
Route::middleware(['auth'])->group(function () {
    Route::get('/department', [DepartmentController::class, 'index'])->name('department');

    Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index');
    Route::post('/departments/update', [DepartmentController::class, 'update'])->name('departments.update');
    Route::post('/departments/create', [DepartmentController::class, 'store'])->name('departments.store');
    Route::delete('/departments/{name}', [DepartmentController::class, 'destroy'])->name('departments.destroy');
    Route::resource('departments', DepartmentController::class);

    Route::get('/member', [MemberController::class, 'index'])->name('member');
    Route::get('/members', [MemberController::class, 'index'])->name('members.index');
    Route::get('/members/filter/{department}', [MemberController::class, 'filterByDepartment'])
        ->name('members.filter');

    Route::get('/members/create', [MemberController::class, 'create'])->name('members.create');
    Route::get('/members/{member}', [MemberController::class, 'show'])->name('members.show');
    Route::get('/members/{member}/edit', [MemberController::class, 'edit'])->name('members.edit');
    Route::get('/members/search', [MemberController::class, 'search'])->name('members.search');
    Route::post('/members', [MemberController::class, 'store'])->name('members.store');
    Route::put('/members/{member}', [MemberController::class, 'update'])->name('members.update');
    Route::delete('/members/{member}', [MemberController::class, 'destroy'])->name('members.destroy');

    // // Add new route for individual member view
    // Route::get('/members/{id}/individual', [MemberController::class, 'individual'])->name('members.individual');

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
    });

    // Add these new routes
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    // Add this new route for fetching member details
    Route::get('/members/{member}/details', [MemberController::class, 'getMemberDetails'])->name('members.details');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Task routes
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    // Admin only routes
});

Route::middleware(['auth', 'role:admin,manager'])->group(function () {
    // Admin and manager routes
});

// Get all departments (for dropdown)
Route::get('/departments', function() {
    return App\Models\Department::select('id', 'name')->get();
});

Route::post('/tasks/{task}/toggle-favorite', [TaskController::class, 'toggleFavorite'])->name('tasks.toggle-favorite');

// Add this route for fetching member data
Route::get('/members/{member}/data', [MemberController::class, 'getMemberData'])->name('members.getData');

Route::get('/tasks/{task}/data', [TaskController::class, 'getData'])->name('tasks.getData');

Route::get('/tasks/{task}/subtasks', [TaskController::class, 'getSubtasks'])->name('tasks.subtasks');

