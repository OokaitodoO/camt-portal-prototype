<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'fullname' => 'Admin User',
            'status' => 'active',
            'role' => 'admin',
            'department_name' => 'IT Department',
            'profileImage' => null
        ]);

        // Create staff user
        User::create([
            'email' => 'staff@example.com',
            'password' => Hash::make('password'),
            'fullname' => 'Staff User',
            'status' => 'active',
            'role' => 'staff',
            'department_name' => 'Marketing',
            'profileImage' => null
        ]);

        // Create manager user
        User::create([
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'fullname' => 'Manager User',
            'status' => 'active',
            'role' => 'manager',
            'department_name' => 'Sales',
            'profileImage' => null
        ]);

        User::create([
            'email' => 'headstaff@example.com',
            'password' => Hash::make('password'),
            'fullname' => 'Head Staff User',
            'status' => 'active',
            'role' => 'headstaff',
            'department_name' => 'Sales',
            'profileImage' => null
        ]);

        User::create([
            'email' => 'staff1@example.com',
            'password' => Hash::make('password'),   
            'fullname' => 'Staff 1',
            'status' => 'active',
            'role' => 'staff',
            'department_name' => 'Marketing',
            'profileImage' => null
        ]);
        
        User::create([
            'email' => 'staff2@example.com',
            'password' => Hash::make('password'),
            'fullname' => 'Staff 2',
            'status' => 'active',
            'role' => 'staff',
            'department_name' => 'Marketing',
            'profileImage' => null
        ]);
    }
}