<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array(auth()->user()->role, ['admin', 'cashier']);
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'contract_type' => ['required', 'string', 'in:regular_1_month,student_1_month'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['nullable', 'string', 'in:active,inactive,expired'],

            // Trainer fields - FIX: trainer → trainers
            'trainer_id' => ['nullable', 'integer', 'exists:trainers,id'],
            'trainer_package' => ['nullable', 'string', 'in:trainer_15_days,trainer_1_month'],
            
            'payment_type' => ['required', 'string', 'in:cash,gcash'],
            'contract_amount' => ['required', 'numeric', 'min:0'],
            'payment_amount' => ['required', 'numeric', 'min:0'],
            'or_number' => ['nullable', 'string', 'max:255'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
            'payment_status' => ['nullable', 'string', 'in:pending,paid,failed'],
        ];
    }
}