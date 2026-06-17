<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'equipment_name' => $this->equipment_name,
            'brand' => $this->brand,
            'model' => $this->model,
            'category' => $this->category,
            'serial_number' => $this->serial_number,
            'quantity' => $this->quantity,
            'status' => $this->status,
            'equipment_image' => $this->equipment_image ? asset('storage/' . $this->equipment_image) : null,
            'description' => $this->description,
            'purchase_date' => $this->purchase_date?->format('Y-m-d'),
            'warranty_expiry' => $this->warranty_expiry?->format('Y-m-d'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}