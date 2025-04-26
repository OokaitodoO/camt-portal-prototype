<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'position',
        'department_id',
        'profile_picture',
        'phone',
        'email'
    ];

    public function department()
    {
        // return $this->belongsTo(Department::class);
    }
} 