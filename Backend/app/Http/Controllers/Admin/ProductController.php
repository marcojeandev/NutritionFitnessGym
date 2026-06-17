<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Products;
use App\Http\Requests\Admin\ProductStoreRequest;
use App\Http\Requests\Admin\ProductUpdateRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    use AuthorizesRequests;

    public function store(ProductStoreRequest $request)
    {
        try {
            $validated = $request->validated();
            $this->authorize('create', Products::class);

            $validated["profile"] = $request->hasFile('profile') ?
                $request->file('profile')->store('products', 'public') : null;

            $products = Products::create($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Product data created successfully!.',
                'data' => new ProductResource($products),
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create product data. Please try again.',
            ], 500);
        }
    }

    public function update(ProductUpdateRequest $request, $id)
    {
        try {
            $validated = $request->validated();
            $products = Products::findOrFail($id);
            $this->authorize('update', $products);

            if($request->hasFile('profile')){
                if($products->profile && Storage::disk('public')->exists($products->profile)){
                    Storage::disk('public')->delete($products->profile);
                }
                $validated["profile"] = $request->file('profile')->store('products', 'public');
            }

            $products->update($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Product data updated successfully!.',
                'data' => new ProductResource($products->fresh()),
            ], 200); // 200 for update, not 201
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update product data. Please try again.',
            ], 500);
        }
    }

    public function index()
    {
        try {
            $this->authorize('viewAny', Products::class);
            $products = Products::all();

            return response()->json([
                'status' => 1,
                'message' => 'Products fetched successfully!',
                'data' => ProductResource::collection($products),
            ], 200); // 200 for index, not 201
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch products data. Please try again.',
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $products = Products::find($id);

            if (!$products) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Product not found.',
                ], 404);
            }

            $this->authorize('view', $products);

            return response()->json([
                'status' => 1,
                'message' => 'Product fetched successfully!',
                'data' => new ProductResource($products),
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch product data. Please try again.',
            ], 500);
        }
    }

    public function destroy($id){
        try {
            $products = Products::findOrFail($id);
            $this->authorize('delete', $products);

            if($products->profile && Storage::disk('public')->exists($products->profile)){
                Storage::disk('public')->delete($products->profile);
            }
            $products->delete();
            return response()->json([
                'status' => 1,
                'message' => 'Product deleted successfully!',
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to Delete product data. Please try again.',
            ], 500);
        }
    }
}