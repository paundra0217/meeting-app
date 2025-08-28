<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_start',
        'meeting_end',
        'client_id',
        'user_id',
        'meeting_location',
        'meeting_topic',
        'meeting_code',
        'cancelled',
        'cancelled_date',
        'cancelled_reason'
    ];

    protected $casts = [
        'meeting_start' => 'datetime',
        'meeting_end' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo('App\Models\User', 'user_id');
    }

    public function client() {
        return $this->belongsTo('App\Models\Client', 'client_id');
    }
}
