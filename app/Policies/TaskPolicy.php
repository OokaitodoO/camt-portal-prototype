<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Task;

class TaskPolicy
{
    public function view(User $user, Task $task)
    {
        return $user->role === 'admin' ||
               $user->role === 'manager' ||
               ($user->role === 'headstaff' && $user->department_id === $task->department_id) ||
               $user->id === $task->assigned_to;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['admin', 'manager', 'headstaff']);
    }

    public function update(User $user, Task $task)
    {
        return $user->role === 'admin' ||
               $user->role === 'manager' ||
               ($user->role === 'headstaff' && $user->department_id === $task->department_id);
    }

    public function delete(User $user, Task $task)
    {
        return $user->role === 'admin' ||
               ($user->role === 'manager' && $user->department_id === $task->department_id);
    }
} 