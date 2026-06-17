<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSold extends Model
{
    protected $table = 'product_sold';
    
    protected $fillable = [
        'paycheck_id', 'product_id', 'quantity', 'price_at_sale'
    ];

    public function paycheck(): BelongsTo
    {
        return $this->belongsTo(ProductPaycheck::class, 'paycheck_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}