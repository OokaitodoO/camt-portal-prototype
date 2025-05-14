<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;

class Member extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'first_name',
        'last_name',
        'position',
        'department_id',
        'sub_department',
        'phone',
        'role',
        'profile_picture'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    // Helper methods for role checking
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isManager()
    {
        return $this->role === 'manager';
    }

    public function isMember()
    {
        return $this->role === 'member';
    }

    // Query scope for filtering by role
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    // Query scope for department managers
    public function scopeDepartmentManagers($query)
    {
        return $query->where('role', 'manager');
    }
} 