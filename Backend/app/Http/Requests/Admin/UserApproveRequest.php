<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UserApproveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        if(auth()->check() && (auth()->user()->isAdmin() || auth()->user()->isCashier())){
            return true;
        }
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_type'     => ['required', 'string', 'in:cash,gcash'],
            'payment_amount'   => ['required', 'numeric', 'min:0'],
            'or_number'        => ['nullable', 'string', 'max:255'], 
            'transaction_id'   => ['nullable', 'string', 'max:255'], 
            'payment_status'   => ['nullable', 'string', 'in:pending,paid,failed'],
        ];
    }
}
