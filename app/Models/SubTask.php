<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SubTask extends Model
{
    use HasFactory;

    protected $table = 'sub_tasks';

    protected $fillable = [
        'task_id',
        'title',
        'link'
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
