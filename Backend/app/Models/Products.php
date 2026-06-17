<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Products extends Model
{
    protected $table = 'products';
    
    protected $fillable = [
        'name', 'description', 'price', 'quantity', 'sold', 'profile'
    ];

    public function soldItems(): HasMany
    {
        return $this->hasMany(ProductSold::class, 'product_id');
    }
}