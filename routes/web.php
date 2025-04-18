<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\TaskController;

Route::get('/', [LoginController::class, 'index']);

Route::get('/department', [DepartmentController::class, 'index'])->name('department');

Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index');
Route::post('/departments/update', [DepartmentController::class, 'update'])->name('departments.update');
Route::post('/departments/create', [DepartmentController::class, 'store'])->name('departments.store');
Route::delete('/departments/{name}', [DepartmentController::class, 'destroy'])->name('departments.destroy');

Route::get('/member', [MemberController::class, 'index'])->name('member');
Route::get('/members', [MemberController::class, 'index'])->name('members.index');

Route::get('/members/create', [MemberController::class, 'create'])->name('members.create');
Route::post('/members', [MemberController::class, 'store'])->name('members.store');
Route::get('/members/{member}/edit', [MemberController::class, 'edit'])->name('members.edit');
Route::put('/members/{member}', [MemberController::class, 'update'])->name('members.update');
Route::delete('/members/{member}', [MemberController::class, 'destroy'])->name('members.destroy');
Route::get('/members/search', [MemberController::class, 'search'])->name('members.search');
Route::get('/members/{member}/show', [MemberController::class, 'show'])->name('members.show');

// // Add new route for individual member view
// Route::get('/members/{id}/individual', [MemberController::class, 'individual'])->name('members.individual');

Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');

