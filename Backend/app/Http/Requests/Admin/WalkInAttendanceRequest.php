<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class WalkInAttendanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        if(auth()->check() && (auth()->user()->isAdmin() ||auth()->user()->isCashier() )){
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
            'walk_in_id' => ['required', 'exists:walk_in_info,id'],
            'time_in' => ['nullable', 'date_format:Y-m-d H:i:s'],
            'fee_paid' => ['nullable', 'numeric', 'min:0'],
            'assisted_by' => ['required', 'exists:users,id'],
        ];
    }
}
