<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'IT Department'],
            ['name' => 'Marketing'],
            ['name' => 'Sales'],
            ['name' => 'HR'],
            ['name' => 'Finance']
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }
    }
} 