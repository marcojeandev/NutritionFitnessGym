<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    protected $table = 'equipments';
    protected $fillable = [
        'equipment_name',
        'equipment_description',
        'equipment_status',
        'equipment_image',
    ];
}
