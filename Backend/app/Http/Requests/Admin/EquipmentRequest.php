<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class EquipmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() || auth()->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'equipment_name' => ['required', 'string', 'max:255'],
            'equipment_description' => ['nullable', 'string', 'min:20'],
            'equipment_status' => ['required', 'string', 'in:good,damaged,repair'],
            'equipment_name' => ['required', 'image', 'mimes:jpg,png,gif,jpeg', 'max:2040'],
        ];
    }
}
