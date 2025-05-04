<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Department;
use Illuminate\Support\Facades\Auth;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    public function index()
    {
        $user = auth()->user(); // This will now be a Member model
        
        // Filter tasks based on user role
        if ($user->isAdmin()) {
            // Show all tasks
            $tasks = Task::with(['department', 'assignedTo', 'assignedBy'])->get();
        } elseif ($user->isManager()) {
            // Show only department tasks
            $tasks = Task::where('department_id', $user->department_id)
                        ->with(['department', 'assignedTo', 'assignedBy'])
                        ->get();
        } else {
            // Show only assigned tasks
            $tasks = Task::where('assigned_to', $user->id)
                        ->with(['department', 'assignedTo', 'assignedBy'])
                        ->get();
        }

        $departments = Department::all();
        return view('task', compact('tasks', 'departments'));
    }

    public function filterByDepartment($departmentId)
    {
        $tasks = Task::where('department_id', $departmentId)
                     ->with(['department', 'assignedTo', 'assignedBy'])
                     ->get();
                     
        return response()->json([
            'success' => true,
            'tasks' => $tasks
        ]);
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();
            
            // Log incoming request data
            Log::info('Creating new task with data:', $request->all());

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'department_id' => 'required|exists:departments,id',
                'assigned_to' => 'required|exists:members,id',
                'deadline' => 'nullable|date',
                'logo' => 'nullable|image|max:2048',
                'link' => 'nullable|string'
            ]);

            // Create task with default values
            $task = new Task();
            $task->title = $validated['title'];
            $task->description = $validated['description'] ?? null;
            $task->department_id = $validated['department_id'];
            $task->assigned_to = $validated['assigned_to'];
            $task->deadline = $validated['deadline'] ?? null;
            $task->link = $validated['link'] ?? null;
            $task->status = 'pending';
            $task->is_favorite = false;
            $task->assigned_by = auth()->id();
            
            // Handle logo upload
            if ($request->hasFile('logo')) {
                $file = $request->file('logo');
                $path = $file->store('task-logos', 'public');
                $task->logo_path = $path;
            }
            
            $task->save();

            // Handle subtasks
            if ($request->has('sub_tasks')) {
                $subTasks = json_decode($request->sub_tasks, true);
                if (is_array($subTasks)) {
                    foreach ($subTasks as $subTaskData) {
                        if (!empty($subTaskData['title'])) {
                            $task->subTasks()->create([
                                'title' => $subTaskData['title'],
                                'link' => $subTaskData['link'] ?? null
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            // Load relationships for response
            $task = $task->load(['department', 'assignedTo', 'assignedBy', 'subTasks']);
            
            return response()->json([
                'success' => true,
                'message' => 'สร้างภาระงานสำเร็จ',
                'task' => $task
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Task creation error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            Log::error('Request data:', $request->all());
            
            return response()->json([
                'success' => false,
                'message' => 'Error creating task: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getDepartmentMembers($departmentId)
    {
        try {
            $members = Member::where('department_id', $departmentId)
                            ->select('id', 'first_name', 'last_name')
                            ->get();
                            
            return response()->json([
                'success' => true,
                'members' => $members
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get department members'
            ], 500);
        }
    }

    public function edit(Task $task)
    {
        try {
            // Load all relationships including subtasks
            $task->load(['department', 'assignedTo', 'assignedBy', 'subTasks']);

            // Add debug logging
            Log::info('Fetching task with subtasks:', [
                'task_id' => $task->id,
                'subtasks_count' => $task->subTasks->count(),
                'subtasks' => $task->subTasks->toArray()
            ]);

            $taskData = [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'link' => $task->link,
                'deadline' => $task->deadline,
                'logo_path' => $task->logo_path ? asset('storage/' . $task->logo_path) : null,
                'department' => $task->department ? [
                    'id' => $task->department->id,
                    'name' => $task->department->name
                ] : null,
                'assigned_to' => $task->assignedTo ? [
                    'id' => $task->assignedTo->id,
                    'first_name' => $task->assignedTo->first_name,
                    'last_name' => $task->assignedTo->last_name
                ] : null,
                'sub_tasks' => $task->subTasks->map(function($subTask) {
                    return [
                        'id' => $subTask->id,
                        'title' => $subTask->title,
                        'link' => $subTask->link ?? ''
                    ];
                })->toArray()
            ];

            return response()->json([
                'success' => true,
                'task' => $taskData
            ]);
            
        } catch (\Exception $e) {
            Log::error('Task edit error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error loading task details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Task $task)
    {
        try {
            DB::beginTransaction();
            
            // Log the deletion attempt
            Log::info('Attempting to delete task: ' . $task->id);
            
            // Delete associated subtasks first
            $task->subTasks()->delete();
            
            // Delete the task logo if it exists
            if ($task->logo_path) {
                \Storage::disk('public')->delete($task->logo_path);
            }
            
            // Delete the task
            $task->delete();
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error deleting task: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error deleting task',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function update(Request $request, Task $task)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'department_id' => 'required|exists:departments,id',
                'assigned_to' => 'required|exists:members,id',
                'deadline' => 'nullable|date',
                'logo' => 'nullable|image|max:2048',
                'link' => 'nullable|string'
            ]);

            // Update main task fields
            $task->title = $validated['title'];
            $task->description = $validated['description'] ?? null;
            $task->department_id = $validated['department_id'];
            $task->assigned_to = $validated['assigned_to'];
            $task->deadline = $validated['deadline'] ?? null;
            $task->link = $validated['link'] ?? null;

            // Handle logo upload
            if ($request->hasFile('logo')) {
                // Delete old logo if exists
                if ($task->logo_path) {
                    Storage::disk('public')->delete($task->logo_path);
                }
                $task->logo_path = $request->file('logo')->store('task-logos', 'public');
            }

            $task->save();

            // Handle subtasks
            if ($request->has('sub_tasks')) {
                $subTasks = json_decode($request->sub_tasks, true);
                
                if (is_array($subTasks)) {
                    // Get existing subtask IDs
                    $existingSubTaskIds = $task->subTasks->pluck('id')->toArray();
                    $updatedSubTaskIds = [];

                    foreach ($subTasks as $subTaskData) {
                        if (!empty($subTaskData['title'])) {
                            if (isset($subTaskData['id'])) {
                                // Update existing subtask
                                $subTask = $task->subTasks()->find($subTaskData['id']);
                                if ($subTask) {
                                    $subTask->update([
                                        'title' => $subTaskData['title'],
                                        'link' => $subTaskData['link'] ?? null
                                    ]);
                                    $updatedSubTaskIds[] = $subTask->id;
                                }
                            } else {
                                // Create new subtask
                                $newSubTask = $task->subTasks()->create([
                                    'title' => $subTaskData['title'],
                                    'link' => $subTaskData['link'] ?? null
                                ]);
                                $updatedSubTaskIds[] = $newSubTask->id;
                            }
                        }
                    }

                    // Delete removed subtasks
                    $task->subTasks()
                        ->whereNotIn('id', $updatedSubTaskIds)
                        ->delete();
                }
            }

            DB::commit();

            // Load relationships for response
            $task = $task->load(['department', 'assignedTo', 'assignedBy', 'subTasks']);

            return response()->json([
                'success' => true,
                'message' => 'อัพเดทภาระงานสำเร็จ',
                'task' => $task
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Task update error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            Log::error('Request data:', $request->all());
            
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการอัพเดทภาระงาน',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleFavorite(Task $task)
    {
        try {
            $task->is_favorite = !$task->is_favorite;
            $task->save();
            
            return response()->json([
                'success' => true,
                'is_favorite' => $task->is_favorite
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error toggling favorite status'
            ], 500);
        }
    }
}