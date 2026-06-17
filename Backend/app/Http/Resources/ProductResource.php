<?php

namespace App\Http\Resources;

use Illuminate\Http\Requests;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'quantity' => $this->quantity,
            'sold' => $this->sold,
            'profile' => $this->profile,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}