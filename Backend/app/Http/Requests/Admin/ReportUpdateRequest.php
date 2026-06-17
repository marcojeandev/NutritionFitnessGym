<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReportUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && (auth()->user()->isAdmin() || auth()->user()->isCashier());
    }

    public function rules(): array
    {
        return [
            'report_type' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'files' => ['nullable', 'array'],
            'files.*.file_title' => ['required_with:files', 'string', 'max:255'],
            'files.*.file_path' => ['required_with:files', 'string', 'max:255'],
        ];
    }
}