<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $fillable = [
        'user_id',
        'time_in',
        'time_out',
    ];

    protected $casts = [
        'time_in' => 'datetime:H:i:s',
        'time_out' => 'datetime:H:i:s',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function isCheckedIn($userId): bool
    {
        return self::where('user_id', $userId)
            ->whereDate('created_at', now()->toDateString())
            ->whereNull('time_out')
            ->exists();
    }

    public static function getTodayAttendance($userId)
    {
        return self::where('user_id', $userId)
            ->whereDate('created_at', now()->toDateString())
            ->first();
    }
}