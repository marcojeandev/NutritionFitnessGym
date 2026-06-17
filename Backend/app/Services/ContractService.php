<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ContractService
{
    public function create(array $data): Contract
    {
        return DB::transaction(function () use ($data) {
            // Check if user exists and is active
            $user = User::where('id', $data['user_id'])
                        ->where('status', 'active')
                        ->first();
            
            if (!$user) {
                throw new \Exception('User is not active. Cannot create contract.');
            }

            // Check if user already has an active contract
            $existingContract = Contract::where('user_id', $data['user_id'])
                                        ->where('status', 'active')
                                        ->first();
            
            if ($existingContract) {
                throw new \Exception('User has an active contract. Cannot create new contract.');
            }

            // Create contract - WITHOUT trainer fields
            $contract = Contract::create([
                'user_id' => $data['user_id'],
                'contract_type' => $data['contract_type'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'status' => $data['status'] ?? 'active',
            ]);

            // Create payment - WITH trainer fields here
            $paymentData = [
                'user_id' => $data['user_id'],
                'payment_type' => $data['payment_type'],
                'contract_amount' => $data['contract_amount'],
                'payment_amount' => $data['payment_amount'],
                'or_number' => $data['or_number'] ?? null,
                'transaction_id' => $data['transaction_id'] ?? null,
                'payment_status' => $data['payment_status'] ?? 'pending',
            ];

            // Add trainer fields to payment if they exist
            if (isset($data['trainer_id'])) {
                $paymentData['trainer_id'] = $data['trainer_id'];
            }
            
            if (isset($data['trainer_package'])) {
                $paymentData['trainer_package'] = $data['trainer_package'];
            }

            $contract->payment()->create($paymentData);

            // Load relationships
            return $contract->load(['user', 'payment']);
        });
    }

    public function update(Contract $contract, array $data): Contract
    {
        return DB::transaction(function () use ($contract, $data) {
            // Update contract fields only
            $contractData = array_filter([
                'user_id' => $data['user_id'] ?? $contract->user_id,
                'contract_type' => $data['contract_type'] ?? $contract->contract_type,
                'start_date' => $data['start_date'] ?? $contract->start_date,
                'end_date' => $data['end_date'] ?? $contract->end_date,
                'status' => $data['status'] ?? $contract->status,
            ], function ($value) {
                return !is_null($value);
            });
            
            $contract->update($contractData);

            // Update payment - including trainer fields
            $paymentData = array_filter([
                'payment_type' => $data['payment_type'] ?? null,
                'contract_amount' => $data['contract_amount'] ?? null,
                'payment_amount' => $data['payment_amount'] ?? null,
                'or_number' => $data['or_number'] ?? null,
                'transaction_id' => $data['transaction_id'] ?? null,
                'payment_status' => $data['payment_status'] ?? null,
                'trainer_id' => $data['trainer_id'] ?? null,
                'trainer_package' => $data['trainer_package'] ?? null,
            ], function ($value) {
                return !is_null($value);
            });

            if (!empty($paymentData)) {
                $contract->payment()->update($paymentData);
            }

            return $contract->fresh()->load(['user', 'payment']);
        });
    }
}