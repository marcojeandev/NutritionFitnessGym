<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'full_name' => $this->user->firstname . ' ' . $this->user->lastname,
                    'firstname' => $this->user->firstname,
                    'lastname' => $this->user->lastname,
                    'email' => $this->user->email,
                    'username' => $this->user->username,
                    'contact' => $this->user->contact,
                    'address' => $this->user->address,
                    'status' => $this->user->status,
                    'role' => $this->user->role,
                    'qr_code' => $this->user->qr_code,
                    'profile' => $this->user->profile ? asset('storage/' . $this->user->profile) : null,
                    'birthday' => $this->user->birthday,
                    'sex' => $this->user->sex,
                    'height' => $this->user->height,
                    'weight' => $this->user->weight,
                ];
            }),
            'time_in' => $this->time_in,
            'time_out' => $this->time_out,
            'date' => $this->created_at->format('Y-m-d'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}