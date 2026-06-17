<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class WalkInInfoCreateRequest extends FormRequest
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
            'firstname' => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'in:jr,II,III,IV,V,VI'],
            'email' => ['required', 'email', 'unique:walk_in_info,email', 'max:255'],
            'contact' => ['required', 'string', 'min:11', 'max:15', 'unique:walk_in_info,contact']
        ];
    }
}
