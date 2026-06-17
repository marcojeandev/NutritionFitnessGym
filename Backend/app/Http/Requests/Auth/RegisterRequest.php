<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'firstname'  => ['required', 'string', 'max:255'],
            'lastname'   => ['required', 'string', 'max:255'],
            'contact'    => ['nullable', 'string', 'max:255'],
            'qr_code'    => ['nullable', 'string'],
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