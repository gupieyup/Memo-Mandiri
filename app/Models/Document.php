<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'judul',
        'periode_mulai',
        'periode_selesai',
        'status',
        'file_name',
        'file_path',
        'file_size',
        'file_type',
        'notes',
        'area_id',
        'user_id',
        'category_id',
    ];

    /**
     * Cast attributes
     */
    protected $casts = [
        'periode_mulai'   => 'date',
        'periode_selesai' => 'date',
    ];

    /**
     * RELATIONSHIPS
     */

    // Document belongs to Area
    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    // Document belongs to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Document belongs to Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Document has many feedbacks
    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }
}