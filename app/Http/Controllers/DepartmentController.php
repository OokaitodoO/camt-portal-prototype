<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class DepartmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $user = Auth::user();
        $departments = $user->getVisibleDepartments();
        
        return view('department', compact('departments'));
    }

    public function update(Request $request, Department $department)
    {
        try {
            Log::info('Update request received', [
                'department_id' => $department->id,
                'request_data' => $request->all()
            ]);

            // Validate the request
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'icon' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            // Update department name
            $department->name = $validated['name'];

            // Handle file upload if present
            if ($request->hasFile('icon')) {
                // Delete old icon if exists
                if ($department->icon_path) {
                    Storage::disk('public')->delete($department->icon_path);
                }

                // Store new icon
                $path = $request->file('icon')->store('departments', 'public');
                $department->icon_path = $path;
            }

            // Save changes
            $department->save();

            return response()->json([
                'success' => true,
                'message' => 'Department updated successfully',
                'department' => $department
            ]);

        } catch (\Exception $e) {
            Log::error('Department update failed', [
                'error' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update department: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'icon' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $department = new Department();
            $department->name = $validated['name'];

            if ($request->hasFile('icon')) {
                $path = $request->file('icon')->store('departments', 'public');
                $department->icon_path = $path;
            }

            $department->save();

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully',
                'department' => $department
            ]);

        } catch (\Exception $e) {
            \Log::error('Department creation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            // Check if user is admin
            if (!auth()->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Find the department
            $department = Department::findOrFail($id);

            // Check if department has any members
            $hasMember = \App\Models\Member::where('department_id', $id)->exists();
            if ($hasMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'ไม่สามารถลบหน่วยงานได้ เนื่องจากมีสมาชิกอยู่ในหน่วยงานนี้'
                ], 400);
            }

            // Delete the department's icon if it exists
            if ($department->icon_path) {
                Storage::delete('public/' . $department->icon_path);
            }

            // Delete the department
            $department->delete();

            return response()->json([
                'success' => true,
                'message' => 'ลบหน่วยงานสำเร็จ'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting department: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการลบหน่วยงาน',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDepartmentData($id)
    {
        try {
            $department = Department::findOrFail($id);
            
            // Format the icon path correctly
            $iconPath = $department->icon_path;
            if ($iconPath) {
                // Remove '/storage/' prefix if it exists
                $iconPath = str_replace('/storage/', '', $iconPath);
            }
            
            return response()->json([
                'success' => true,
                'department' => [
                    'id' => $department->id,
                    'name' => $department->name,
                    'icon_path' => $iconPath
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching department data:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching department data'
            ], 500);
        }
    }

    public function getData(Department $department)
    {
        try {
            return response()->json([
                'success' => true,
                'department' => $department
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching department data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching department data'
            ], 500);
        }
    }

    public function reorder(Request $request)
    {
        try {
            // Check if user is admin
            if (!auth()->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Check if order column exists
            if (!Schema::hasColumn('departments', 'order')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order column not found in database. Please run migrations first.'
                ], 400);
            }

            // Validate the request
            $validated = $request->validate([
                'departments' => 'required|array',
                'departments.*.id' => 'required|integer|exists:departments,id',
                'departments.*.order' => 'required|integer|min:0'
            ]);

            Log::info('Reordering departments', ['data' => $validated['departments']]);

            // Update the order for each department
            foreach ($validated['departments'] as $departmentData) {
                Department::where('id', $departmentData['id'])
                    ->update(['order' => $departmentData['order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Department order updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error reordering departments: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update department order'
            ], 500);
        }
    }

    /**
     * Get member and task count for a department
     */
    public function getMembersCount(Department $department)
    {
        try {
            $memberCount = $department->members()->count();
            
            // Count tasks for all members in this department
            $taskCount = 0;
            foreach ($department->members as $member) {
                $taskCount += $member->tasks()->count();
            }
            
            return response()->json([
                'success' => true,
                'memberCount' => $memberCount,
                'taskCount' => $taskCount
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error getting members count for department: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get member count'
            ], 500);
        }
    }

    /**
     * Delete department with all members and their tasks
     */
    public function destroyWithMembers(Department $department)
    {
        try {
            // Check if user is admin
            if (!auth()->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            DB::transaction(function () use ($department) {
                // Delete all tasks for members in this department
                foreach ($department->members as $member) {
                    $member->tasks()->delete();
                }
                
                // Delete all members in this department
                $department->members()->delete();
                
                // Delete the department's icon if it exists
                if ($department->icon_path) {
                    Storage::delete('public/' . $department->icon_path);
                }
                
                // Delete the department
                $department->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'ลบหน่วยงานและข้อมูลที่เกี่ยวข้องสำเร็จ'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting department with members: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการลบหน่วยงาน',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
