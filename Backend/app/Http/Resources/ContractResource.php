<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class ContractResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'contract_type' => $this->contract_type,
            
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            
            
            'status' => $this->status,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            
            'user' => $this->whenLoaded('user', function () {
                return $this->user ? [
                    'id' => $this->user->id,
                    'firstname' => $this->user->firstname ?? null,
                    'lastname' => $this->user->lastname ?? null,
                    'full_name' => $this->user->full_name ?? ($this->user->firstname . ' ' . $this->user->lastname),
                    'email' => $this->user->email ?? null,
                    'phone' => $this->user->phone ?? null,
                    'status' => $this->user->status ?? null,
                    'role' => $this->user->role ?? null,
                ] : null;
            }),
            
            'payment' => $this->whenLoaded('payment', function () {
                return $this->payment ? [
                    'id' => $this->payment->id,
                    'payment_type' => $this->payment->payment_type ?? null,
                    'contract_amount' => $this->payment->contract_amount ?? null,
                    'payment_amount' => $this->payment->payment_amount ?? null,
                    'or_number' => $this->payment->or_number ?? null,
                    'transaction_id' => $this->payment->transaction_id ?? null,
                    'payment_status' => $this->payment->payment_status ?? null,
                    'trainer_id' => $this->payment->trainer_id ?? null,
                    'trainer_package' => $this->payment->trainer_package ?? null,
                ] : null;
            }),
            
            'member' => $this->user?->full_name ?? $this->user?->firstname . ' ' . $this->user?->lastname ?? 'N/A',
        ];
    }
    
    protected function formatDate($date): ?string
    {
        if (!$date) {
            return null;
        }
        
        if ($date instanceof Carbon) {
            return $date->format('Y-m-d');
        }
        
        try {
            return Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception $e) {
            return $date; 
        }
    }
}