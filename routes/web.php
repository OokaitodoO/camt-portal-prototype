<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\Auth\CMUOAuthController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\TaskController;
use App\Models\Member;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Auth\CMUController;

// Public routes
Route::get('/', [LoginController::class, 'index'])->name('home');
Route::get('/login', [LoginController::class, 'index'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Health check route for debugging
Route::get('/health', function() {
    return response()->json([
        'status' => 'ok',
        'app_env' => app()->environment(),
        'app_debug' => config('app.debug'),
        'app_key_set' => !empty(config('app.key')),
        'database' => [
            'connection' => config('database.default'),
            'connected' => true
        ],
        'storage_writable' => is_writable(storage_path()),
        'timestamp' => now()->toISOString()
    ]);
})->name('health');

// CMU OAuth Routes
Route::get('/oauth/cmu', [CMUOAuthController::class, 'redirect'])->name('oauth.cmu');
Route::get('/auth/cmu', [CMUController::class, 'redirect'])->name('cmu.login');
Route::get('/oauth/callback/cmu', [CMUController::class, 'callback'])->name('cmu.callback');

// Protected routes
Route::middleware(['auth'])->group(function () {
    // Dashboard redirect
    Route::get('/dashboard', function() {
        $user = auth()->user();
        if ($user->isStaff()) {
            return redirect()->route('members.show', $user->id);
        }
        return redirect()->route('departments.index');
    })->name('dashboard');

    // Department routes
    Route::prefix('departments')->group(function () {
        Route::get('/', [DepartmentController::class, 'index'])->name('departments.index');
        Route::post('/create', [DepartmentController::class, 'store'])->name('departments.store');
        Route::post('/reorder', [DepartmentController::class, 'reorder'])->name('departments.reorder');
        Route::get('/{department}/data', [DepartmentController::class, 'getData'])->name('departments.getData');
        Route::post('/{department}/update', [DepartmentController::class, 'update'])->name('departments.update');
        Route::delete('/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');
        
        Route::get('/storage/{path}', function ($path) {
            $fullPath = storage_path('app/public/departments/' . $path);
            if (!file_exists($fullPath)) {
                return response()->json(['message' => 'Image not found'], 404);
            }
            return response()->file($fullPath);
        })->where('path', '.*');
    });

    // Member routes
    Route::prefix('members')->group(function () {
        Route::get('/', [MemberController::class, 'index'])->name('members.index');
        Route::post('/', [MemberController::class, 'store'])->name('members.store');
        Route::post('/reorder', [MemberController::class, 'reorder'])->name('members.reorder');
        Route::post('/{member}/update', [MemberController::class, 'update'])->name('members.update');
        Route::delete('/{member}', [MemberController::class, 'destroy'])->name('members.destroy');
        Route::get('/{member}/data', [MemberController::class, 'getMemberData'])->name('members.getData');
        Route::get('/filter/{departmentId}', [MemberController::class, 'filter'])->name('members.filter');
        Route::get('/{member}', [MemberController::class, 'show'])->name('members.show');
        
        Route::get('/storage/{filename}', function ($filename) {
            $path = storage_path('app/public/members/' . $filename);
            if (!file_exists($path)) {
                return response()->json(['message' => 'Image not found'], 404);
            }
            return response()->file($path);
        });

        Route::delete('/{member}/with-tasks', [MemberController::class, 'destroyWithTasks'])
            ->name('members.destroyWithTasks');

        // Change POST to PUT for the profile picture update route
        Route::put('/{member}/update-profile-picture', [MemberController::class, 'updateProfilePicture'])
            ->name('members.updateProfilePicture');
    });

    // Task routes - accessible to all authenticated users
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index'])->name('tasks.index');
        Route::post('/', [TaskController::class, 'store'])->name('tasks.store');
        Route::post('/reorder', [TaskController::class, 'reorder'])->name('tasks.reorder');
        Route::get('/filter/{departmentId}', [TaskController::class, 'filterByDepartment'])->name('tasks.filter');
        Route::get('/department/{departmentId}/members', function($departmentId) {
            $members = Member::where('department_id', $departmentId)->get();
            return response()->json([
                'success' => true,
                'members' => $members
            ]);
        })->name('tasks.department.members');
        Route::post('/{task}/update', [TaskController::class, 'update'])->name('tasks.update');
        Route::delete('/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
        Route::get('/search-members', [TaskController::class, 'searchMembers'])->name('tasks.search-members');
        Route::get('/{task}/data', [TaskController::class, 'getData'])->name('tasks.getData');
        Route::get('/{task}/subtasks', [TaskController::class, 'getSubtasks'])->name('tasks.subtasks');
        Route::post('/{task}/toggle-favorite', [TaskController::class, 'toggleFavorite'])->name('tasks.toggle-favorite');
        Route::get('/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');
        Route::get('/{task}', [TaskController::class, 'show'])->name('tasks.show');
    });
});

// Remove these duplicate routes if they exist
// Route::get('/departments', function () { ... })->middleware('auth');
// Route::get('storage/departments/{filename}', function ($filename) { ... });

