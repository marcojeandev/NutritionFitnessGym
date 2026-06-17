<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductSoldResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'paycheck_id' => $this->paycheck_id,
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'price_at_sale' => $this->price_at_sale,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Include the actual product data
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}