<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductPaycheckStoreRequest;
use App\Http\Requests\Admin\ProductPaycheckUpdateRequest;
use App\Http\Resources\ProductPaycheckResource;
use App\Services\ProductPaycheckService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\ProductPaycheck;

class ProductPaycheckController extends Controller
{
    use AuthorizesRequests;

    protected $paycheckService;

    public function __construct(ProductPaycheckService $paycheckService)
    {
        $this->paycheckService = $paycheckService;
    }

    public function index()
    {
        try {
            $this->authorize('viewAny', ProductPaycheck::class);
            $paychecks = $this->paycheckService->getAllPaychecks();

            return response()->json([
                'status' => 1,
                'message' => 'Product paychecks fetched successfully.',
                'data' => ProductPaycheckResource::collection($paychecks),
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error. Please try again.',
            ], 500);
        }
    }

    public function store(ProductPaycheckStoreRequest $request)
    {
        try {
            $this->authorize('create', ProductPaycheck::class);
            
            $paycheck = $this->paycheckService->createPaycheck($request->validated());

            return response()->json([
                'status' => 1,
                'message' => 'Product paycheck successfully created.',
                'data' => new ProductPaycheckResource($paycheck),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => $e->getMessage() ?: 'Server error. Please try again.',
            ], 500);
        }
    }

    // ✅ ADD THIS UPDATE METHOD
    public function update(ProductPaycheckUpdateRequest $request, $id)
    {
        try {
            $paycheck = ProductPaycheck::findOrFail($id);
            $this->authorize('update', $paycheck);
            
            $updatedPaycheck = $this->paycheckService->updatePaycheck($id, $request->validated());

            return response()->json([
                'status' => 1,
                'message' => 'Product paycheck successfully updated.',
                'data' => new ProductPaycheckResource($updatedPaycheck),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => $e->getMessage() ?: 'Server error. Please try again.',
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $paycheck = ProductPaycheck::findOrFail($id);
            $this->authorize('delete', $paycheck);

            $this->paycheckService->deletePaycheck($id);

            return response()->json([
                'status' => 1,
                'message' => 'Product paycheck successfully deleted.',
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => $e->getMessage() ?: 'Server error. Please try again.',
            ], 500);
        }
    }
}