<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\WalkInAttendance;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WalkInInfo extends Model
{
    protected $table = 'walk_in_info';
    protected $fillable = [
        'firstname',
        'middlename',
        'lastname',
        'suffix',
        'email',
        'contact'
    ];
    public function walk_in_attendance(): HasMany{
        return $this->hasMany(WalkInAttendance::class);
    }
}
