<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPaycheck extends Model
{
    protected $table = 'product_paycheck';
    
    protected $fillable = [
        'sold_by', 'paid_by', 'paid_by_name', 'payment_type',
        'or_number', 'transaction_id', 'payment_status'
    ];

    public function soldBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sold_by');
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProductSold::class, 'paycheck_id');
    }
}