<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() || (auth()->user()->isAdmin() || auth()->user()->isCashier());
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fullname' => 'required|string|max:255',
            'date' => 'required|date|after_or_equal:today',
            'time_start' => 'required|date_format:H:i',
            'time_end' => 'required|date_format:H:i|after:time_start',
            'payment_type' => 'nullable|in:cash,gcash',
            'reservation_amount' => 'required|numeric|min:0',
            'payment_amount' => 'required|numeric|min:0|lte:reservation_amount',
            'or_number' => 'nullable|string|max:50|required_if:payment_type,cash',
            'transaction_id' => 'nullable|string|max:100|required_if:payment_type,gcash',
            'payment_status' => 'nullable|in:pending,paid,partial,refunded',
            'reservation_status' => 'nullable|in:active,expired,cancelled,completed',
        ];
    }
}
