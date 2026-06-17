<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalkInAttendance extends Model
{
    protected $table = 'walk_in_attendance';
    protected $fillable = [
        'walk_in_id',
        'time_in',
        'fee_paid',
        'assisted_by'
    ];
    public function WalkInInfo(): BelongsTo{
        return $this->BelongsTo(WalkInInfo::class);
    }
}
