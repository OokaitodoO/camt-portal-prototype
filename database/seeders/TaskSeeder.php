<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\Member;
use Carbon\Carbon;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all members
        $members = Member::all();
        
        // Get a random admin/manager for assigned_by
        $assignedBy = Member::whereIn('role', ['admin', 'manager'])->inRandomOrder()->first();
        
        // Sample task templates
        $taskTemplates = [
            [
                'title' => 'ข้อมูลทดลอง',
                'description' => 'ข้อมูลทอดลอง',
                'link' => 'google.com',
            ],        
        ];

        // Create tasks for each member
        foreach ($members as $member) {
            // Assign 2-3 random tasks to each member
            $numTasks = rand(2, 3);
            
            for ($i = 0; $i < $numTasks; $i++) {
                $template = $taskTemplates[array_rand($taskTemplates)];
                
                // Create task
                Task::create([
                    'title' => $template['title'],
                    'description' => $template['description'],
                    'link' => $template['link'],
                    'status' => array_rand(['pending' => 0, 'in_progress' => 1, 'completed' => 2]),
                    'is_favorite' => (bool)rand(0, 1),
                    'assigned_to' => $member->id,
                    'assigned_by' => $assignedBy->id,
                    'deadline' => Carbon::now()->addDays(rand(1, 30)),
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                    'updated_at' => Carbon::now()
                ]);
            }
        }
    }
}
