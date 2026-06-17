<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalkInAttendanceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'walk_in_id' => $this->walk_in_id,
            'time_in' => $this->time_in,
            'fee_paid' => $this->fee_paid,
            'assisted_by' => $this->assisted_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'walk_in_info' => new WalkInInfoResource($this->whenLoaded('walkInInfo')),
        ];
    }
}