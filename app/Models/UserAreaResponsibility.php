<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAreaResponsibility extends Model
{
    use HasFactory;

    /**
     * Table name (opsional tapi aman)
     */
    protected $table = 'user_area_responsibilities';

    /**
     * Mass assignable fields
     */
    protected $fillable = [
        'supervisor_id',
        'area_id',
    ];

    /**
     * RELATIONSHIPS
     */

    // Supervisor (User)
    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    // Area
    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }
}