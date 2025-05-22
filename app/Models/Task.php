<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'department_id',
        'link',
        'assigned_to',
        'assigned_by',
        'deadline',
        'logo_path',
        'status',
        'is_favorite'
    ];

    protected $attributes = [
        'status' => 'pending',
        'is_favorite' => false
    ];

    protected $casts = [
        'is_favorite' => 'boolean',
        'deadline' => 'date'
    ];

    protected $dates = [
        'deadline',
        'created_at',
        'updated_at'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::deleting(function($task) {
            // The cascade delete will handle sub_tasks automatically
            if ($task->logo_path) {
                \Storage::disk('public')->delete($task->logo_path);
            }
        });
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(Member::class, 'assigned_to');
    }

    public function assignedBy()
    {
        return $this->belongsTo(Member::class, 'assigned_by');
    }

    public function subTasks()
    {
        return $this->hasMany(SubTask::class);
    }

    public static function getVisibleTasks($user)
    {
        if ($user->isAdmin() || $user->isManager() || $user->isHeadstaff()) {
            // Allow headstaff to see all tasks like manager
            return self::with(['assignedTo', 'assignedBy', 'department'])->get();
        }
        
        // For staff, only show tasks from their department
        return self::with(['assignedTo', 'assignedBy', 'department'])
            ->whereHas('assignedTo', function($query) use ($user) {
                $query->where('department_id', $user->department_id);
            })
            ->get();
    }
}
