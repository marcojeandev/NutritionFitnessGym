<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        if(auth()->user()->isAdmin() || auth()->user()->isCashier()){
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
            'firstname'  => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname'   => ['required', 'string', 'max:255'],
            'suffix'     => ['nullable', 'string', 'in:jr,II,III,IV,V,VI'],
            'contact'    => ['nullable', 'string', 'max:255'],
            'address'    => ['nullable', 'string'],
            'birthday'   => ['nullable', 'date'],
            'qr_code'    => ['nullable', 'string'],
            'sex'        => ['nullable', 'string', 'in:male,female'],
            'email'      => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'username'      => ['required', 'string', 'max:255', 'unique:users,username'],
            'profile' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048', 'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000'],
            'password'   => [
                'required',
                'string',
                Password::min(8)
                    ->mixedCase()
                    ->symbols(),
            ],
            'payment_amount' => 'required|numeric|min:150',
            'or_number'        => ['required', 'string', 'max:255'], 
            'transaction_id'   => ['nullable', 'string', 'max:255'], 
            'payment_type'   => ['required', 'string', 'in:cash,gcash'],
        ];
    }
}
