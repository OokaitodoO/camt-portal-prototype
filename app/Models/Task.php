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
        'assigned_to',
        'assigned_by',
        'status',
        'deadline',
        'logo_path',
        'link'
    ];

    protected $dates = ['deadline'];

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

    public function subtasks()
    {
        return $this->hasMany(Subtask::class);
    }
}
