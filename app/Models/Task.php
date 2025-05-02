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
        'logo_path'
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
}
