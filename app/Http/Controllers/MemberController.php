<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $member->first_name = $request->first_name;
        $member->last_name = $request->last_name;
        $member->position = $request->position;
        $member->department_id = $request->department_id;

        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
            if ($member->profile_picture) {
                Storage::disk('public')->delete($member->profile_picture);
            }
            
            $path = $request->file('profile_picture')->store('members', 'public');
            $member->profile_picture = $path;
        }

        $member->save();

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
        $members = Member::with('department')->get();
        $departments = Department::all();
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
        // Load the member with their department and assigned tasks
        $member->load(['department', 'assignedTasks' => function($query) {
            $query->with(['department', 'assignedBy', 'subTasks']);
        }]);

        // Get assigned tasks for the member
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
            $member->load('department'); // Load the department relationship
            
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
                    'department' => $member->department
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch member data'
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
} 