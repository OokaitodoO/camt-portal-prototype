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
        $user = auth()->user();
        
        // Redirect staff to their individual page
        if ($user->isStaff()) {
            return redirect()->route('members.show', $user->id);
        }

        // For non-staff users, continue with existing logic
        $departments = $user->getVisibleDepartments();

        switch ($user->role) {
            case 'admin':
            case 'manager':
                $tasks = Task::with(['assignedTo', 'assignedBy'])->get();
                break;

            case 'headstaff':
                $tasks = Task::where(function($query) use ($user) {
                    $query->whereHas('assignedTo', function($q) use ($user) {
                        $q->where('department_id', $user->department_id);
                    });
                })
                ->with(['assignedTo', 'assignedBy'])
                ->get();
                break;

            default:
                $tasks = collect();
        }

        // Group tasks by department
        $tasksByDepartment = $tasks->groupBy(function($task) {
            return $task->assignedTo->department->name ?? 'ไม่ระบุหน่วยงาน';
        });

        $totalTasks = $tasks->count();

        return view('task', compact('departments', 'tasksByDepartment', 'totalTasks'));
    }

    public function filterByDepartment($departmentId)
    {
        $user = auth()->user();

        // For headstaff, only allow accessing their own department
        if ($user->isHeadstaff() && $departmentId != $user->department_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $tasks = Task::whereHas('assignedTo', function($query) use ($departmentId) {
            $query->where('department_id', $departmentId);
        })
        ->with(['assignedTo', 'assignedBy'])
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
            
            // Log the incoming request data
            Log::info('Task creation request data:', $request->all());

            // Update validation rules
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'link' => 'nullable|string|max:255',
                'deadline' => 'nullable|date_format:Y-m-d|after_or_equal:today',  // Updated validation
                'assigned_to' => 'required|string',
                'logo' => 'nullable|image|max:2048'
            ]);

            // Handle empty deadline
            if (empty($validated['deadline'])) {
                $validated['deadline'] = null;
            }

            // Parse assigned_to into array
            $assignedToIds = array_filter(explode(',', $validated['assigned_to']));
            
            if (empty($assignedToIds)) {
                throw new \Exception('At least one member must be assigned to the task');
            }

            // Handle logo upload if present
            $logoPath = null;
            if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
                $logoPath = $request->file('logo')->store('task-logos', 'public');
            }

            // Create tasks for each assigned member
            $createdTasks = [];
            foreach ($assignedToIds as $memberId) {
                $task = Task::create([
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? null,
                    'link' => $validated['link'] ?? null,
                    'deadline' => $validated['deadline'],
                    'assigned_to' => $memberId,
                    'assigned_by' => auth()->id(),
                    'logo_path' => $logoPath,
                    'status' => 'pending'
                ]);

                // Handle subtasks if present
                if ($request->has('sub_tasks')) {
                    $subTasks = json_decode($request->sub_tasks, true);
                    if (is_array($subTasks)) {
                        foreach ($subTasks as $subTask) {
                            if (!empty($subTask['title'])) {
                                $task->subTasks()->create([
                                    'title' => $subTask['title'],
                                    'link' => $subTask['link'] ?? null
                                ]);
                            }
                        }
                    }
                }

                $createdTasks[] = $task->load(['assignedTo', 'subTasks']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tasks created successfully',
                'tasks' => $createdTasks
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Task creation error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error creating task: ' . $e->getMessage(),
                'debug_info' => [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
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
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'link' => 'nullable|string',
                'deadline' => 'nullable|date_format:Y-m-d',  // Updated validation
                'sub_tasks' => 'nullable|json',
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            DB::beginTransaction();

            // Handle file upload if present
            if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
                if ($task->logo_path) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $task->logo_path));
                }
                $logoPath = $request->file('logo')->store('task-logos', 'public');
                $task->logo_path = $logoPath;
            }

            // Update basic task information
            $task->title = $validatedData['title'];
            $task->description = $validatedData['description'] ?? null;
            $task->link = $validatedData['link'] ?? null;
            $task->deadline = $validatedData['deadline'] ?? null;

            // Save the task
            $task->save();

            // Handle subtasks if present
            if ($request->has('sub_tasks')) {
                $task->subTasks()->delete();
                
                $subTasks = json_decode($request->sub_tasks, true);
                if (is_array($subTasks)) {
                    foreach ($subTasks as $subTask) {
                        if (!empty($subTask['title'])) {
                            $task->subTasks()->create([
                                'title' => $subTask['title'],
                                'link' => $subTask['link'] ?? null
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Task updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating task: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update task: ' . $e->getMessage()
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

    // Add this new method to search members
    public function searchMembers(Request $request)
    {
        try {
            $query = $request->get('query');

            $members = Member::where(function($q) use ($query) {
                $q->where('first_name', 'LIKE', "%{$query}%")
                  ->orWhere('last_name', 'LIKE', "%{$query}%");
            })
            ->with('department') // Eager load department
            ->select('id', 'first_name', 'last_name', 'department_id')
            ->limit(10)
            ->get()
            ->map(function($member) {
                return [
                    'id' => $member->id,
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'department_name' => $member->department ? $member->department->name : null
                ];
            });

            return response()->json([
                'success' => true,
                'members' => $members
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search members'
            ], 500);
        }
    }

    public function show(Task $task)
    {
        try {
            // Check if user is authenticated
            if (!auth()->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Load the necessary relationships
            $task->load(['assignedTo', 'assignedBy', 'subTasks']);
            
            return response()->json([
                'success' => true,
                'task' => $task
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing task: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error loading task details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getData(Task $task)
    {
        try {
            $task = $task->load(['department', 'subTasks', 'assignedTo']);
            
            // Format the task data
            $taskData = $task->toArray();
            $taskData['assigned_to_name'] = $task->assignedTo ? 
                $task->assignedTo->first_name . ' ' . $task->assignedTo->last_name : null;
            
            return response()->json([
                'success' => true,
                'task' => $taskData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch task data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSubtasks(Task $task)
    {
        try {
            return response()->json([
                'success' => true,
                'subtasks' => $task->subTasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subtasks: ' . $e->getMessage()
            ], 500);
        }
    }
}