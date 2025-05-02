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
    Route::get('/members/filter/{departmentId}', [MemberController::class, 'filterByDepartment'])->name('members.filter');

    Route::get('/members/create', [MemberController::class, 'create'])->name('members.create');
    Route::post('/members', [MemberController::class, 'store'])->name('members.store');
    Route::get('/members/{member}/edit', [MemberController::class, 'edit'])->name('members.edit');
    Route::put('/members/{member}', [MemberController::class, 'update'])->name('members.update');
    Route::delete('/members/{member}', [MemberController::class, 'destroy'])->name('members.destroy');
    Route::get('/members/search', [MemberController::class, 'search'])->name('members.search');
    Route::get('/members/{member}', [MemberController::class, 'show'])->name('members.show');

    // // Add new route for individual member view
    // Route::get('/members/{id}/individual', [MemberController::class, 'individual'])->name('members.individual');

    Route::prefix('tasks')->group(function () {
        // View all tasks
        Route::get('/', [TaskController::class, 'index'])->name('tasks.index');
        
        // Create new task
        Route::post('/', [TaskController::class, 'store'])->name('tasks.store');
        
        // Filter tasks by department
        Route::get('/filter/{departmentId}', [TaskController::class, 'filterByDepartment'])
            ->name('tasks.filter');
        
        // Get members by department (for dropdown)
        Route::get('/department/{departmentId}/members', [TaskController::class, 'getDepartmentMembers'])
            ->name('tasks.department.members');
        
        // Update task
        Route::put('/{task}', [TaskController::class, 'update'])->name('tasks.update');
        
        // Delete task
        Route::delete('/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    });
});

// Get all departments (for dropdown)
Route::get('/departments', function() {
    return App\Models\Department::select('id', 'name')->get();
});

