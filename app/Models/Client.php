<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Client extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'client_name',
        'rep_name',
        'rep_email',
        'rep_phone',
        'client_address',
    ];

    public function routeNotificationForMail($notification)
    {
        return $this->rep_email;
    }
}
