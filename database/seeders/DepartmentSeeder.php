<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            'การเงินและบัญชี',        
        ];

        foreach ($departments as $name) {
            Department::firstOrCreate(
                ['name' => $name], // Check if exists by name
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
} 