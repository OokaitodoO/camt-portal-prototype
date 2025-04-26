<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Department;

class TaskController extends Controller
{
    public function index()
    {
        // $departments = Department::all();
        // return view('task', compact('departments'));
        return view('task');
    }
    
}