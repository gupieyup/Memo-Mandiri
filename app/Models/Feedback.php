<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'feedbacks';

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'message',
        'user_id',
        'document_id',
    ];

    /**
     * RELATIONSHIPS
     */

    // Feedback belongs to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Feedback belongs to Document
    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}