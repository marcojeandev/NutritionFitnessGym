<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Contract;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $table = 'contract_payment';

    protected $fillable = [
        'contract_id',
        'user_id',
        'payment_type',
        'contract_amount',
        'payment_amount',
        'or_number',
        'transaction_id',
        'payment_status',
        'trainer_id',
        'trainer_package',
    ];
    protected $casts = [
        'contract_amount' => 'decimal:2',
        'payment_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}