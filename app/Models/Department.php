<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use App\Models\Member;

class Department extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'departments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'icon_path',
        'order'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The default ordering for departments
     */
    protected static function boot()
    {
        parent::boot();
        
        // Set default order when creating a new department
        static::creating(function ($department) {
            if (is_null($department->order)) {
                $department->order = static::max('order') + 1 ?? 0;
            }
        });
    }

    /**
     * Scope to order departments by their order field
     */
    public function scopeOrdered($query)
    {
        // Check if order column exists
        $hasOrderColumn = Schema::hasColumn('departments', 'order');
        
        if ($hasOrderColumn) {
            return $query->orderBy('order', 'asc')->orderBy('id', 'asc');
        } else {
            // Fallback to just ID ordering if order column doesn't exist
            return $query->orderBy('id', 'asc');
        }
    }

    // Update the relationship to use id
    public function members()
    {
        return $this->hasMany(Member::class, 'department_id');
    }
}