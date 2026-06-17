<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductPaycheckStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array(auth()->user()->role, ['admin', 'cashier']);
    }

    public function rules(): array
    {
        return [
            "sold_by" => ["required", "exists:users,id"],
            "paid_by" => ["nullable", "exists:users,id"],
            "paid_by_name" => ["nullable", "string", "max:255"],
            "payment_type" => ["required", "string", "in:cash,gcash"],
            "or_number" => ["required", "string", "unique:product_paycheck,or_number"],
            "transaction_id" => ["nullable", "string", "max:255"],
            "payment_status" => ["nullable", "string", "in:pending,paid,failed"],
            
            // Only products array (remove single product option to avoid confusion)
            "products" => ["required", "array", "min:1"],
            "products.*.product_id" => ["required", "exists:products,id"],
            "products.*.quantity" => ["required", "integer", "min:1"],
            "products.*.price_at_sale" => ["required", "numeric", "min:0"],
        ];
    }
    public function messages(): array
    {
        return [
            'or_number.unique' => 'This OR number already exists.',
            'product_id.required_without' => 'Either product_id or products array is required.',
            'products.required_without' => 'Either product_id or products array is required.',
            'products.*.product_id.required_with' => 'Each product must have a product_id.',
            'products.*.quantity.min' => 'Quantity must be at least 1.',
            'products.*.price_at_sale.min' => 'Price must be at least 0.',
        ];
    }
}