<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'contract_id' => $this->contract_id,
            'user_id' => $this->user_id,
            'payment_type' => $this->payment_type,
            'contract_amount' => $this->contract_amount,
            'payment_amount' => $this->payment_amount,
            'or_number' => $this->or_number,
            'transaction_id' => $this->transaction_id,
            'payment_status' => $this->payment_status,
            'trainer_id' => $this->trainer_id,
            'trainer_package' => $this->trainer_package,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}