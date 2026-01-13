<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'nama',
    ];

    /**
     * RELATIONSHIPS
     */

    // One category has many documents
    public function documents()
    {
        return $this->hasMany(Document ::class);
    }
}