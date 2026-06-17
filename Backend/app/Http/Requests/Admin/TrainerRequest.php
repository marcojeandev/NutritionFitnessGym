<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TrainerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Allow only admin users to create/update trainers
        return auth()->check() && (auth()->user()->isAdmin() || auth()->user()->isCashier());
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'firstname' => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'email' => [
                'nullable', 
                'email', 
                'max:255',
                $isUpdate ? 'unique:trainers,email,' . $this->route('trainer') : 'unique:trainers,email'
            ],
            'contact' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9+\-\s()]+$/'
            ],
            'profile' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'address' => ['nullable', 'string', 'max:500'],
            'total_trained' => ['nullable', 'integer', 'min:0'],
            'sex' => ['nullable', 'string', 'in:male,female'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'firstname.required' => 'First name is required.',
            'firstname.max' => 'First name cannot exceed 255 characters.',
            'lastname.required' => 'Last name is required.',
            'lastname.max' => 'Last name cannot exceed 255 characters.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email is already registered for another trainer.',
            'contact.regex' => 'Please enter a valid contact number.',
            'profile.image' => 'The file must be an image.',
            'profile.mimes' => 'Profile image must be of type: jpeg, png, jpg, or gif.',
            'profile.max' => 'Profile image must not exceed 2MB.',
            'total_trained.integer' => 'Total trained must be a number.',
            'total_trained.min' => 'Total trained cannot be negative.',
            'sex.in' => 'Sex must be either male or female.',
        ];
    }
}