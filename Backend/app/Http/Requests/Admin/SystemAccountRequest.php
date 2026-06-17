<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class SystemAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'firstname'  => ['required', 'string', 'max:255'],
            'lastname'   => ['required', 'string', 'max:255'],
            'contact'    => ['nullable', 'string', 'max:255'],
            // 'qr_code'    => ['nullable', 'string'],
            'sex'        => ['nullable', 'string', 'in:male,female'],
            'email'      => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'username'      => ['required', 'string', 'max:255', 'unique:users,username'],
            'profile'    => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'password'   => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->symbols(),
            ]
        ];
    }
}
