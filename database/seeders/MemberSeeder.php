<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Member;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        Member::firstOrCreate(
            ['email' => 'kanjanawat_muangkam@cmu.ac.th'],
            [
                'password' => Hash::make('password'),
                'first_name' => 'Admin',
                'last_name' => 'User',
                'position' => 'System Administrator',
                'department_id' => Department::first()->id,
                'role' => 'admin',
                'phone' => '0123456789',
                'profile_picture' => null,
                'created_at' => now(),
                'updated_at' => now(),
                'cmu_account' => 'kanjanawat_muangkam@cmu.ac.th',
            ]
        );        
    }
} 