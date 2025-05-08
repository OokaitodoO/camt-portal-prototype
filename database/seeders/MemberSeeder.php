<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Member;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class MemberSeeder extends Seeder
{
    private function thaiToEnglish($str) {
        $thai = [
            'ก', 'ข', 'ฃ', 'ค', 'ฅ', 'ฆ', 'ง', 'จ', 'ฉ', 'ช',
            'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด',
            'ต', 'ถ', 'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ',
            'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ษ', 'ส',
            'ห', 'ฬ', 'อ', 'ฮ', 'ะ', 'ั', 'า', 'ำ', 'ิ', 'ี',
            'ึ', 'ื', 'ุ', 'ู', 'เ', 'แ', 'โ', 'ใ', 'ไ', 'ๅ',
            'ๆ', '็', '่', '้', '๊', '๋', '์', 'ํ', '๎', '๏',
            'สมชาย', 'สมหญิง', 'วิชัย', 'มานี', 'ปิยะ', 'รัตนา', 'ธนา', 'พิมพ์', 'ศักดิ์', 'นภา',
            'รักดี', 'ใจดี', 'มีสุข', 'สุขใจ', 'ดีงาม', 'มานะ', 'พากเพียร', 'ศรีไทย', 'ภักดี', 'รุ่งเรือง'
        ];
        
        $english = [
            'k', 'k', 'k', 'k', 'k', 'k', 'ng', 'j', 'ch', 'ch',
            's', 'ch', 'y', 'd', 't', 't', 't', 't', 'n', 'd',
            't', 't', 't', 't', 'n', 'b', 'p', 'ph', 'f', 'ph',
            'f', 'ph', 'm', 'y', 'r', 'l', 'w', 's', 's', 's',
            'h', 'l', 'o', 'h', 'a', 'a', 'a', 'am', 'i', 'i',
            'ue', 'ue', 'u', 'u', 'e', 'ae', 'o', 'ai', 'ai', '',
            '', '', '', '', '', '', '', '', '', '',
            'somchai', 'somying', 'wichai', 'manee', 'piya', 'rattana', 'thana', 'pim', 'sak', 'napa',
            'rakdee', 'jaidee', 'meesuk', 'sukjai', 'deengam', 'mana', 'phakphian', 'srithai', 'phakdee', 'rungruang'
        ];
        
        return str_replace($thai, $english, $str);
    }

    public function run(): void
    {
        // Create admin user
        Member::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'password' => Hash::make('password'),
                'first_name' => 'Admin',
                'last_name' => 'User',
                'position' => 'System Administrator',
                'department_id' => Department::first()->id,
                'role' => 'admin',
                'phone' => '0123456789',
                'profile_picture' => null
            ]
        );

        // Sample member data
        $members = [
            [
                'email' => 'manager@example.com',
                'password' => 'password',
                'first_name' => 'Manager',
                'last_name' => 'User',
                'position' => 'Department Manager',
                'role' => 'manager',
                'phone' => '0123456789'
            ],
            [
                'email' => 'staff1@example.com',
                'password' => 'password',
                'first_name' => 'Staff',
                'last_name' => 'One',
                'position' => 'Staff Member',
                'role' => 'staff',
                'phone' => '0123456789'
            ],
            [
                'email' => 'staff2@example.com',
                'password' => 'password',
                'first_name' => 'Staff',
                'last_name' => 'Two',
                'position' => 'Staff Member',
                'role' => 'staff',
                'phone' => '0123456789'
            ]
        ];

        // Get all departments
        $departments = Department::all();

        // Create members
        foreach ($members as $memberData) {
            // Assign random department
            $department = $departments->random();
            
            Member::firstOrCreate(
                ['email' => $memberData['email']],
                [
                    'password' => Hash::make($memberData['password']),
                    'first_name' => $memberData['first_name'],
                    'last_name' => $memberData['last_name'],
                    'position' => $memberData['position'],
                    'department_id' => $department->id,
                    'role' => $memberData['role'],
                    'phone' => $memberData['phone'],
                    'profile_picture' => null
                ]
            );
        }

        // // Create additional random staff members
        // $firstNames = ['สมชาย', 'สมหญิง', 'วิชัย', 'มานี', 'ปิยะ', 'รัตนา', 'ธนา', 'พิมพ์', 'ศักดิ์', 'นภา'];
        // $lastNames = ['รักดี', 'ใจดี', 'มีสุข', 'สุขใจ', 'ดีงาม', 'มานะ', 'พากเพียร', 'ศรีไทย', 'ภักดี', 'รุ่งเรือง'];

        // for ($i = 0; $i < 20; $i++) {
        //     $firstName = $firstNames[array_rand($firstNames)];
        //     $lastName = $lastNames[array_rand($lastNames)];
        //     $email = strtolower($this->thaiToEnglish($firstName)) . 
        //             '.' . strtolower($this->thaiToEnglish($lastName)) . 
        //             $i . '@example.com';

        //     Member::firstOrCreate(
        //         ['email' => $email],
        //         [
        //             'password' => Hash::make('password'),
        //             'first_name' => $firstName,
        //             'last_name' => $lastName,
        //             'position' => 'Staff Member',
        //             'department_id' => $departments->random()->id,
        //             'role' => 'staff',
        //             'phone' => '0' . rand(610000000, 999999999),
        //             'profile_picture' => null
        //         ]
        //     );
        // }
    }
} 