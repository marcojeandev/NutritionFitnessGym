<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Payment;
use App\Models\User;
use App\Services\ContractService;
use App\Http\Requests\Admin\ContractRequest;
use App\Http\Requests\Admin\ContractUpdateRequest;
use App\Http\Resources\ContractResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ContractController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private ContractService $contractService
    ) {}

    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Contract::class);

            $contracts = Contract::query()
                ->with(['user', 'payment'])
                ->when($request->search, function ($query) use ($request) {
                    $query->whereHas('user', function ($q) use ($request) {
                        $q->where('firstname', 'like', "%{$request->search}%")
                          ->orWhere('lastname', 'like', "%{$request->search}%");
                    });
                })
                ->when($request->status, function ($query) use ($request) {
                    $query->where('status', $request->status);
                })
                ->when($request->contract_type, function ($query) use ($request) {
                    $query->where('contract_type', $request->contract_type);
                })
                ->latest()
                ->paginate($request->per_page ?? 15);

            $contracts->getCollection()->transform(function ($contract) {
                return new ContractResource($contract);
            });

            return response()->json([
                'status' => 1,
                'message' => 'Contracts fetched successfully.',
                'data' => $contracts,
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('Failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch Contracts. Please try again.',
            ], 500);
        }
    }
    public function store(ContractRequest $request)
    {
        try {
            $validated = $request->validated();
            
            $this->authorize('create', Contract::class);

            $contract = $this->contractService->create($validated);
            
            return response()->json([
                'status' => 1,
                'message' => 'Contract created successfully.',
                'data' => new ContractResource($contract),
            ], 201);
            
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'status' => 0,
                'message' => 'You are not authorized to create contracts.'
            ], 403);
        } catch (\Exception $e) {
            Log::error('Contract creation failed', ['error' => $e->getMessage()]);
            
            $errorMessage = $e->getMessage();
            if (str_contains($errorMessage, 'User has an active contract') || 
                str_contains($errorMessage, 'User is not active')) {
                return response()->json([
                    'status' => 0,
                    'message' => $errorMessage
                ], 422);
            }
            
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $errorMessage
            ], 500);
        }
    }

    public function update(ContractUpdateRequest $request, $id)
    {
        try {
            $contract = Contract::findOrFail($id);
            
            $this->authorize('update', $contract);

            $validated = $request->validated();
            $updatedContract = $this->contractService->update($contract, $validated);
            
            return response()->json([
                'status' => 1,
                'message' => 'Contract updated successfully.',
                'data' => new ContractResource($updatedContract),
            ], 200);
            
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'status' => 0,
                'message' => 'You are not authorized to update this contract.'
            ], 403);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Contract not found.'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Contract update failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Contract $contract)
    {
        try {
            $this->authorize('view', $contract);

            return response()->json([
                'status' => 1,
                'message' => 'Contract fetched successfully.',
                'data' => new ContractResource($contract->load(['user', 'payment'])),
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('Failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch Contract. Please try again.',
            ], 500);
        }
    }

    public function destroy(Contract $contract)
    {
        try {
            $this->authorize('delete', $contract);

            // Delete payment first
            if ($contract->payment) {
                $contract->payment->delete();
            }

            $memberName = $contract->user->firstname . ' ' . $contract->user->lastname;
            $contract->delete();

            return response()->json([
                'status' => 1,
                'message' => $memberName . '\'s Contract deleted successfully.',
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('Contract delete failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete Contract. Please try again.',
            ], 500);
        }
    }
}