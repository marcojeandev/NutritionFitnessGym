<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductPaycheckResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'or_number' => $this->or_number,
            'sold_by' => $this->sold_by,
            'paid_by' => $this->paid_by,
            'paid_by_name' => $this->paid_by_name,
            'payment_type' => $this->payment_type,
            'transaction_id' => $this->transaction_id,
            'payment_status' => $this->payment_status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Include items with their products
            'items' => ProductSoldResource::collection($this->whenLoaded('items')),
            
            // For backward compatibility (single product)
            'product' => $this->when($this->relationLoaded('items') && $this->items->count() === 1, function() {
                return new ProductResource($this->items->first()->product);
            }),
            'quantity' => $this->when($this->relationLoaded('items') && $this->items->count() === 1, function() {
                return $this->items->first()->quantity;
            }),
            'unit_price' => $this->when($this->relationLoaded('items') && $this->items->count() === 1, function() {
                return $this->items->first()->price_at_sale;
            }),
            'total_price' => $this->when($this->relationLoaded('items'), function() {
                return $this->items->sum(function($item) {
                    return $item->price_at_sale * $item->quantity;
                });
            }),
        ];
    }
}