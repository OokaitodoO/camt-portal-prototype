<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::all();
        return view('department', compact('departments'));
    }

    public function update(Request $request, $name)
    {
        Log::info('Update department request:', [
            'old_name' => $name,
            'new_name' => $request->input('name'),
            'request_data' => $request->all()
        ]);

        try {
            DB::beginTransaction();
            
            // Find the department
            $department = Department::where('name', $name)->first();
            
            if (!$department) {
                Log::error('Department not found:', ['name' => $name]);
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found'
                ], 404);
            }

            // Validate request
            $validated = $request->validate([
                'name' => 'required|unique:departments,name,' . $department->id
            ]);

            Log::info('Updating department:', [
                'department_id' => $department->id,
                'old_name' => $name,
                'new_name' => $validated['name']
            ]);

            // Update department first
            $department->name = $validated['name'];
            $department->save();

            // The foreign key constraint with CASCADE will automatically update the users table

            DB::commit();

            Log::info('Department updated successfully');

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
        try {
            $validated = $request->validate([
                'name' => 'required|unique:departments,name'
            ]);

            $department = Department::create($validated);

            if ($request->ajax()) {
                return response()->json([
                    'success' => true,
                    'department' => $department,
                    'html' => view('components.department-card', compact('department'))->render()
                ]);
            }

            return redirect()->route('departments.index')
                ->with('success', 'Department created successfully');

        } catch (\Exception $e) {
            Log::error('Department creation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            Log::info('Attempting to delete department with ID: ' . $id);
            
            $department = Department::findOrFail($id);
            
            // Check if department has any members
            if ($department->members()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'ไม่สามารถลบหน่วยงานได้ เนื่องจากมีบุคลากรในหน่วยงานนี้'
                ], 422);
            }

            $department->delete();

            return response()->json([
                'success' => true,
                'message' => 'ลบหน่วยงานสำเร็จ'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting department: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการลบหน่วยงาน',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
