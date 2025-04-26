<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DepartmentController extends Controller
{
    public function index()
    {
        // $departments = Department::all(); // Get all departments from database
        // return view('department', compact('departments'));
        return view('department');
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'old_name' => 'required|string|max:255',
            'icon' => 'nullable|image|max:2048'
        ]);

        $department = Department::where('name', $request->old_name)->firstOrFail();
        $department->name = $request->name;

        if ($request->hasFile('icon')) {
            // Delete old icon if exists
            if ($department->icon_path) {
                Storage::disk('public')->delete($department->icon_path);
            }
            
            $path = $request->file('icon')->store('department-icons', 'public');
            $department->icon_path = $path;
        }

        $department->save();

        return response()->json([
            'success' => true,
            'icon_path' => $department->icon_path ? asset('storage/' . $department->icon_path) : null
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|image|max:2048' // 2MB max
        ]);

        $department = new Department();
        $department->name = $request->name;

        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('department-icons', 'public');
            $department->icon_path = $path;
        }

        $department->save();

        return response()->json([
            'success' => true,
            'icon_path' => $department->icon_path ? asset('storage/' . $department->icon_path) : null
        ]);
    }

    public function destroy($name)
    {
        try {
            $department = Department::where('name', $name)->firstOrFail();
            $department->delete();
            return response()->json(['success' => true, 'message' => 'Department deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Error deleting department: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete department'], 500);
        }
    }
}
