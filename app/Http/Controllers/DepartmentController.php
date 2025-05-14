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

class DepartmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $departments = Department::all();
        return view('department', compact('departments'));
    }

    public function update(Request $request, $id)
    {
        Log::info('Update department request:', [
            'department_id' => $id,
            'new_name' => $request->input('name'),
            'request_data' => $request->all()
        ]);

        try {
            DB::beginTransaction();
            
            // Find the department by ID instead of name
            $department = Department::findOrFail($id);
            
            // Validate request
            $validated = $request->validate([
                'name' => 'required|unique:departments,name,' . $department->id,
                'icon' => 'nullable|image|max:2048'
            ]);

            if ($request->hasFile('icon') && $request->file('icon')->isValid()) {
                // Delete old icon if exists
                if ($department->icon_path) {
                    Storage::disk('public')->delete($department->icon_path);
                }
                $iconPath = $request->file('icon')->store('department-icons', 'public');
                $department->icon_path = $iconPath;
            }

            $department->name = $validated['name'];
            $department->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'department' => $department
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Department update error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update department: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        // Check if user is admin
        if (!auth()->user() || !auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'departmentLogo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $department = new Department();
            $department->name = $validatedData['name'];

            if ($request->hasFile('departmentLogo')) {
                $file = $request->file('departmentLogo');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('public/department_icons', $filename);
                $department->icon_path = str_replace('public/', '', $path);
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
                'message' => 'Failed to create department: ' . $e->getMessage()
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
}
