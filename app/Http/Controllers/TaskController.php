<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Department;
use Illuminate\Support\Facades\Auth;
use App\Models\Member;
use Carbon\Carbon;

class TaskController extends Controller
{
    public function index()
    {
        $departments = Department::all();
        $tasks = Task::with(['department', 'assignedTo', 'assignedBy'])
            ->get()
            ->map(function ($task) {
                if ($task->deadline) {
                    $task->deadline = Carbon::parse($task->deadline);
                }
                return $task;
            });
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
}