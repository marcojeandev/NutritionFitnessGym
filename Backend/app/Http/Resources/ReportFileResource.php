<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReportFileResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'file_title' => $this->file_title,
            'file_path' => $this->file_path,
            'created_at' => $this->created_at,
        ];
    }
}