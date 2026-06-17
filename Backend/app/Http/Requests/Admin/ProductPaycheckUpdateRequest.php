<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductPaycheckUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array(auth()->user()->role, ['admin']);
    }

    public function rules(): array
    {
        return [
            "payment_type" => ["sometimes", "string", "in:cash,gcash"],
            "transaction_id" => ["nullable", "string", "max:255"],
            "payment_status" => ["sometimes", "string", "in:pending,paid,failed"],
            
            // Products array for updating
            "products" => ["sometimes", "array", "min:1"],
            "products.*.product_id" => ["required_with:products", "exists:products,id"],
            "products.*.quantity" => ["required_with:products", "integer", "min:1"],
            "products.*.price_at_sale" => ["required_with:products", "numeric", "min:0"],
        ];
    }

    public function messages(): array
    {
        return [
            'products.*.product_id.exists' => 'Selected product does not exist.',
            'products.*.quantity.min' => 'Quantity must be at least 1.',
            'products.*.price_at_sale.min' => 'Price must be at least 0.',
        ];
    }
}