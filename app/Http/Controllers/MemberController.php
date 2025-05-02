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
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'sub_department' => 'nullable|string|max:255',
            'role' => 'required|in:admin,manager,headstaff,staff',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        try {
            $member = new Member($validated);

            if ($request->hasFile('profile_picture')) {
                $path = $request->file('profile_picture')->store('members', 'public');
                $member->profile_picture = $path;
            }

            $member->save();

            return response()->json([
                'success' => true,
                'message' => 'เพิ่มบุคลากรสำเร็จ',
                'member' => $member->load('department')
            ]);

        } catch (\Exception $e) {
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

    public function index(Request $request)
    {
        try {
            $query = Member::with('department');
            $selectedDepartment = null;

            // If department_id is provided, filter members
            if ($request->has('department_id')) {
                $departmentId = $request->department_id;
                $query->where('department_id', $departmentId);
                $selectedDepartment = Department::findOrFail($departmentId);
            }

            $members = $query->get();
            $departments = Department::all();

            // If it's an AJAX request, return JSON
            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'members' => $members,
                    'selectedDepartment' => $selectedDepartment
                ]);
            }

            // Otherwise return the view
            return view('members.index', compact('members', 'departments', 'selectedDepartment'));

        } catch (\Exception $e) {
            if ($request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'เกิดข้อผิดพลาดในการแสดงข้อมูล'
                ], 500);
            }
            return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการแสดงข้อมูล');
        }
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

    public function show($id)
    {
        try {
            $member = Member::with('department')->findOrFail($id);
            
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'member' => $member
                ]);
            }

            return view('individual', compact('member'));
        } catch (\Exception $e) {
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Member not found'
                ], 404);
            }
            
            return redirect()->route('members.index')
                ->with('error', 'ไม่พบข้อมูลบุคลากร');
        }
    }

    public function filterByDepartment($departmentId)
    {
        try {
            $members = Member::where('department_id', $departmentId)
                            ->with('department')
                            ->get();
            $departments = Department::all();
            $selectedDepartment = Department::findOrFail($departmentId);

            if (request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'members' => $members,
                    'selectedDepartment' => $selectedDepartment
                ]);
            }

            return view('members.index', compact('members', 'departments', 'selectedDepartment'));
        } catch (\Exception $e) {
            if (request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'เกิดข้อผิดพลาดในการกรองข้อมูล'
                ], 500);
            }
            return redirect()->route('members.index')
                    ->with('error', 'เกิดข้อผิดพลาดในการกรองข้อมูล');
        }
    }
} 