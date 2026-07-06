<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use App\Models\Task;
use App\Models\Department;

class Member extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'members';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department_id',
        'cmu_account',
        'organization_code',
        'status',
        'first_name',
        'last_name',
        'position',
        'sub_department',
        'phone',
        'profile_picture',
        'order'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($member) {
            if (is_null($member->order)) {
                $member->order = static::max('order') + 1;
            }
        });
    }

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

    public function isNotManager()
    {
        return $this->role !== 'manager';
    }

    public function isHeadstaff()
    {
        return $this->role === 'headstaff';
    }

    public function isStaff()
    {
        return $this->role === 'staff';
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

    /**
     * Get the departments that should be visible to this member
     */
    public function getVisibleDepartments()
    {
        if ($this->isAdmin() || $this->isManager() || $this->isHeadstaff()) {
            return Department::ordered()->get();
        }
        
        // For staff, only show their own department
        return Department::where('id', $this->department_id)->ordered()->get();
    }

    public function getVisibleMembers()
    {
        if ($this->isAdmin() || $this->isManager() || $this->isHeadstaff()) {
            return Member::with('department')->ordered()->get();
        }
        
        // For staff, only show members from their department
        return Member::with('department')
            ->where('department_id', $this->department_id)
            ->ordered()
            ->get();
    }

    // Add this method for side navigation
    public function getVisibleDepartmentsForSideNav()
    {
        if ($this->isAdmin() || $this->isManager() || $this->isHeadstaff()) {
            return Department::ordered()->get();
        }
        
        // For staff, only show their own department
        return Department::where('id', $this->department_id)->ordered()->get();
    }

    // Add this method to check if a user can view a specific member
    public function canView(Member $targetMember)
    {
        // Admin and Manager can view all members
        if ($this->isAdmin() || $this->isManager() || $this->isHeadstaff()) {
            return true;
        }
        
        // Headstaff can only view members in their department
        // if ($this->isHeadstaff()) {
        //     return $this->department_id === $targetMember->department_id;
        // }
        
        // Staff can only view themselves
        if ($this->isStaff()) {
            return $this->id === $targetMember->id;
        }
        
        return false;
    }

    // Query scope for ordered members
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
} 