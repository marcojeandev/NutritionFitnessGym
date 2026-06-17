<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportFile extends Model
{
    protected $table = 'report_files';
    protected $fillable = [
        'report_id',
        'file_title',
        'file_path'
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}