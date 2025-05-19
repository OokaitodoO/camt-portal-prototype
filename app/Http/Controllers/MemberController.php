<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MemberController extends Controller
{
    public function create()
    {
        // $departments = Department::orderBy('name')->get();
        // return view('members.create', compact('departments'));
        return view('members.create');
    }

    public function store(Request $request)
    {
        try {
            // Log the incoming request data
            \Log::info('Creating new member with data:', $request->all());

            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'position' => 'required|string|max:255',
                'department_id' => 'required|exists:departments,id',
                'sub_department' => 'nullable|string|max:255',
                'role' => 'required|string|in:admin,manager,headstaff,staff',
                'email' => 'nullable|email|max:255|unique:members,email',
                'phone' => 'nullable|string|max:20',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            \Log::info('Validation passed, creating member');

            // Generate a default password (you might want to change this logic)
            $defaultPassword = bcrypt('password123');

            // Create member using mass assignment
            $member = Member::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'position' => $validated['position'],
                'department_id' => $validated['department_id'],
                'sub_department' => $validated['sub_department'] ?? null,
                'role' => $validated['role'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'password' => $defaultPassword, // Add default password
            ]);

            // Handle profile picture separately
            if ($request->hasFile('profile_picture')) {
                $path = $request->file('profile_picture')->store('members', 'public');
                $member->profile_picture = $path;
                $member->save();
            }

            \Log::info('Member created successfully:', ['member_id' => $member->id]);

            return response()->json([
                'success' => true,
                'message' => 'เพิ่มบุคลากรสำเร็จ',
                'member' => $member->load('department')
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'ข้อมูลไม่ถูกต้อง',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Member creation error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการเพิ่มบุคลากร',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function edit(Member $member)
    {
        $departments = Department::orderBy('name')->get();
        return view('members.edit', compact('member', 'departments'));
    }

    public function update(Request $request, Member $member)
    {
        try {
            \Log::info('Updating member with data:', $request->all());
            
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'position' => 'required|string|max:255',
                'department_id' => 'required|exists:departments,id',
                'sub_department' => 'nullable|string|max:255',
                'role' => 'required|string|in:admin,manager,headstaff,staff',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                \Log::info('Processing profile picture upload');
                
                // Delete old profile picture if exists
                if ($member->profile_picture) {
                    Storage::disk('public')->delete($member->profile_picture);
                }
                
                // Store new profile picture
                $path = $request->file('profile_picture')->store('members', 'public');
                \Log::info('New profile picture path:', ['path' => $path]);
                
                // Update the member's profile picture path
                $member->profile_picture = $path;
            }

            // Update other member details
            $member->fill(array_diff_key($validated, ['profile_picture' => '']));
            $member->save();

            \Log::info('Member updated successfully:', [
                'id' => $member->id,
                'profile_picture' => $member->profile_picture
            ]);

            // Load the department relation for the response
            $member->load('department');

            return response()->json([
                'success' => true,
                'message' => 'อัปเดตข้อมูลบุคลากรสำเร็จ',
                'member' => [
                    'id' => $member->id,
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'position' => $member->position,
                    'department_name' => $member->department->name,
                    'profile_picture' => $member->profile_picture ? Storage::url($member->profile_picture) : null
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error updating member:', [
                'member_id' => $member->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Member $member)
    {
        // Delete profile picture if exists
        if ($member->profile_picture) {
            Storage::disk('public')->delete($member->profile_picture);
        }

        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'ลบบุคลากรสำเร็จ'
        ]);
    }

    public function index()
    {
        $user = auth()->user();
        $members = $user->getVisibleMembers();
        $departments = $user->getVisibleDepartments();

        return view('members.index', compact('members', 'departments'));
    }

    public function search(Request $request)
    {
        $query = $request->input('query');
        
        $members = Member::with('department')
            ->where(function($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                  ->orWhere('last_name', 'like', "%{$query}%")
                  ->orWhere('position', 'like', "%{$query}%")
                  ->orWhereHas('department', function($q) use ($query) {
                      $q->where('name', 'like', "%{$query}%");
                  });
            })
            ->orderBy('first_name')
            ->get();

        return response()->json($members);
    }

    public function show(Member $member)
    {
        // Check if the current user can view this member
        if (!auth()->user()->canView($member)) {
            return redirect()->route('members.index')
                ->with('error', 'คุณไม่มีสิทธิ์ในการดูข้อมูลบุคลากรนี้');
        }

        // Load the member with their department and assigned tasks
        $member->load(['department', 'assignedTasks' => function($query) {
            $query->with(['department', 'assignedBy', 'subTasks']);
        }]);

        $assignedTasks = $member->assignedTasks;
        return view('individual', compact('member', 'assignedTasks'));
    }

    public function filterByDepartment(Department $department)
    {
        $members = Member::with('department')->get(); // Get all for the "all" view
        $departments = Department::all();
        return view('members.index', compact('members', 'departments', 'department'));
    }

    public function getMemberData(Member $member)
    {
        try {
            $member->load(['department', 'assignedTasks']);
            
            return response()->json([
                'success' => true,
                'member' => [
                    'id' => $member->id,
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'position' => $member->position,
                    'department_id' => $member->department_id,
                    'sub_department' => $member->sub_department,
                    'role' => $member->role,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'profile_picture' => $member->profile_picture ? Storage::url($member->profile_picture) : null,
                    'department' => [
                        'id' => $member->department->id,
                        'name' => $member->department->name
                    ]
                ],
                'tasks' => $member->assignedTasks->map(function($task) {
                    return [
                        'id' => $task->id,
                        'name' => $task->name,
                        'description' => $task->description,
                        'status' => $task->status
                    ];
                })
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching member data:', [
                'member_id' => $member->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
            ], 500);
        }
    }

    public function getMemberDetails(Member $member)
    {
        try {
            $member->load('department');
            return response()->json([
                'success' => true,
                'member' => [
                    'id' => $member->id,
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'position' => $member->position,
                    'department' => $member->department,
                    'sub_department' => $member->sub_department,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'profile_picture' => $member->profile_picture ? Storage::url($member->profile_picture) : null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch member details'
            ], 500);
        }
    }

    public function destroyWithTasks(Member $member)
    {
        try {
            DB::beginTransaction();
            
            // Delete all tasks associated with the member
            $member->assignedTasks()->delete();
            
            // Delete the member
            $member->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Member and associated tasks deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete member and tasks: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDetailsWithTasks(Member $member)
    {
        try {
            // Load the member's tasks and department with error logging
            \Log::info('Fetching member details with tasks', ['member_id' => $member->id]);
            
            $member->load(['assignedTasks', 'department']);
            
            return response()->json([
                'success' => true,
                'member' => [
                    'id' => $member->id,
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'position' => $member->position,
                    'department' => $member->department,
                    'profile_picture' => $member->profile_picture ? Storage::url($member->profile_picture) : null
                ],
                'tasks' => $member->assignedTasks->map(function($task) {
                    return [
                        'id' => $task->id,
                        'title' => $task->title,
                        'description' => $task->description,
                        'deadline' => $task->deadline,
                        'status' => $task->status
                    ];
                })
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching member details', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching member details: ' . $e->getMessage()
            ], 500);
        }
    }

    public function filter($departmentId)
    {
        $user = auth()->user();
        $departments = $user->getVisibleDepartments();
        
        if ($departmentId === 'all') {
            $members = $user->getVisibleMembers();
        } else {
            $members = Member::with('department')
                ->where('department_id', $departmentId)
                ->get();
        }

        return view('members.index', compact('members', 'departments', 'departmentId'));
    }
} 