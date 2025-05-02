<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Member;
use App\Models\Department;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        // Get department IDs
        $itDepartment = Department::where('name', 'IT Department')->first()->id;
        $marketingDepartment = Department::where('name', 'Marketing')->first()->id;
        $salesDepartment = Department::where('name', 'Sales')->first()->id;

        // Create admin
        Member::create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'position' => 'System Administrator',
            'department_id' => $itDepartment,
            'role' => 'admin',
            'phone' => '0123456789',
            'profile_picture' => null
        ]);

        // Create manager
        Member::create([
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'first_name' => 'Manager',
            'last_name' => 'User',
            'position' => 'Department Manager',
            'department_id' => $salesDepartment,
            'role' => 'manager',
            'phone' => '0123456788',
            'profile_picture' => null
        ]);

        // Create head staff
        Member::create([
            'email' => 'headstaff@example.com',
            'password' => Hash::make('password'),
            'first_name' => 'Head',
            'last_name' => 'Staff',
            'position' => 'Team Leader',
            'department_id' => $salesDepartment,
            'role' => 'headstaff',
            'phone' => '0123456787',
            'profile_picture' => null
        ]);

        // Create regular staff members
        Member::create([
            'email' => 'staff1@example.com',
            'password' => Hash::make('password'),
            'first_name' => 'Staff',
            'last_name' => 'One',
            'position' => 'Marketing Specialist',
            'department_id' => $marketingDepartment,
            'role' => 'staff',
            'phone' => '0123456786',
            'profile_picture' => null
        ]);

        Member::create([
            'email' => 'staff2@example.com',
            'password' => Hash::make('password'),
            'first_name' => 'Staff',
            'last_name' => 'Two',
            'position' => 'Marketing Coordinator',
            'department_id' => $marketingDepartment,
            'role' => 'staff',
            'phone' => '0123456785',
            'profile_picture' => null
        ]);
    }
} 