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
        $validated = $request->validate([
            'title' => 'required',
            'department_id' => 'required|exists:departments,id',
            'assigned_to' => 'required|exists:members,id',
            'deadline' => 'required|date',
            'logo' => 'nullable|image|max:2048'
        ]);

        $task = new Task($validated);
        
        if ($request->hasFile('logo')) {
            $task->logo_path = $request->file('logo')->store('task-logos', 'public');
        }
        
        $task->assigned_by = auth()->id();
        $task->save();

        // Save subtasks
        if ($request->has('subtasks')) {
            foreach ($request->subtasks as $index => $subtaskTitle) {
                $task->subtasks()->create([
                    'title' => $subtaskTitle,
                    'link' => $request->subtask_links[$index] ?? null
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'task' => $task->load(['department', 'assignedTo', 'assignedBy'])
        ]);
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
            Log::info('Fetching task details for task ID: ' . $task->id);
            
            // First, verify the task exists
            if (!$task) {
                Log::error('Task not found');
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            // Load relationships one by one to identify any issues
            try {
                $task->load('department');
            } catch (\Exception $e) {
                Log::error('Error loading department: ' . $e->getMessage());
            }

            try {
                $task->load('assignedTo');
            } catch (\Exception $e) {
                Log::error('Error loading assignedTo: ' . $e->getMessage());
            }

            try {
                $task->load('subTasks');
            } catch (\Exception $e) {
                Log::error('Error loading subTasks: ' . $e->getMessage());
            }

            // Transform the data to ensure it matches the expected format
            $taskData = [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'link' => $task->link,
                'deadline' => $task->deadline,
                'logo_path' => $task->logo_path,
                'department' => $task->department ? [
                    'id' => $task->department->id,
                    'name' => $task->department->name
                ] : null,
                'assigned_to' => $task->assignedTo ? [
                    'id' => $task->assignedTo->id,
                    'first_name' => $task->assignedTo->first_name,
                    'last_name' => $task->assignedTo->last_name
                ] : null,
                'sub_tasks' => $task->subTasks ? $task->subTasks->map(function($subTask) {
                    return [
                        'id' => $subTask->id,
                        'title' => $subTask->title,
                        'link' => $subTask->link
                    ];
                }) : []
            ];

            Log::info('Successfully fetched task data', ['task' => $taskData]);

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
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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
}