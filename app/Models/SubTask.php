<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SubTask extends Model
{
    use HasFactory;

    protected $table = 'subtasks';

    protected $fillable = [
        'title',
        'link',
        'task_id'
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
