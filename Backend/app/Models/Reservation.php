<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $table = 'reservation';
    protected $fillable = [
        'fullname',
        'date',
        'time_start',
        'time_end',
        'payment_type',
        'reservation_amount',
        'payment_amount',
        'or_number',
        'transaction_id',
        'payment_status',
        'reservation_status',
    ];
    
}
