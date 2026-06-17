<?php

namespace App\Services;

use App\Models\ProductPaycheck;
use App\Models\ProductSold;
use App\Models\Products;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductPaycheckService
{
    public function createPaycheck(array $data): ProductPaycheck
    {
        // Validate users are active
        $this->validateActiveUser($data['sold_by']);
        
        if (!empty($data['paid_by'])) {
            $this->validateActiveUser($data['paid_by']);
        }

        // Handle products (single or multiple)
        $items = [];
        
        if (isset($data['product_id'])) {
            // Single product format
            $items = [
                [
                    'product_id' => $data['product_id'],
                    'quantity' => $data['quantity'],
                    'price_at_sale' => $data['unit_price'] ?? $data['price_at_sale'],
                ]
            ];
        } elseif (isset($data['products'])) {
            // Multiple products format
            $items = $data['products'];
        } else {
            throw new \Exception('No products provided.');
        }

        // ✅ VALIDATE STOCK BEFORE ANY DATABASE OPERATION
        foreach ($items as $item) {
            $product = Products::find($item['product_id']);
            if (!$product) {
                throw new \Exception("Product ID {$item['product_id']} does not exist.");
            }
            
            $availableStock = $product->quantity;
            if ($availableStock < $item['quantity'] || $product->quantity == 0) {
                throw new \Exception("Insufficient stock for {$product->name}. Available: {$availableStock}, Requested: {$item['quantity']}");
            }
            
            if ($product->quantity <= 0) {
                throw new \Exception("{$product->name} is out of stock.");
            }
        }

        DB::beginTransaction();

        try {
            // Create receipt header
            $paycheck = ProductPaycheck::create([
                'sold_by' => $data['sold_by'],
                'paid_by' => $data['paid_by'] ?? null,
                'paid_by_name' => $data['paid_by_name'] ?? null,
                'payment_type' => $data['payment_type'],
                'or_number' => $data['or_number'],
                'transaction_id' => $data['transaction_id'] ?? null,
                'payment_status' => $data['payment_status'] ?? 'paid',
            ]);

            // Create each item in product_sold table
            foreach ($items as $item) {
                $this->createProductSoldItem($paycheck->id, $item);
                $this->updateProductInventory($item['product_id'], $item['quantity']);
            }

            DB::commit();
            
            // Load items with their product details for response
            $paycheck->load('items.product');
            
            return $paycheck;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create paycheck: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update Paycheck with Stock Validation
     */
    public function updatePaycheck(int $paycheckId, array $data): ProductPaycheck
    {
        $paycheck = ProductPaycheck::with('items')->findOrFail($paycheckId);

        DB::beginTransaction();

        try {
            // Get original items for inventory restore
            $originalItems = $paycheck->items;

            // ✅ CHECK IF NEW PRODUCTS HAVE SUFFICIENT STOCK (excluding original quantities)
            if (isset($data['products']) && !empty($data['products'])) {
                // Calculate net stock change per product
                $stockChanges = [];
                
                // First, restore original items (negative change)
                foreach ($originalItems as $item) {
                    $productId = $item->product_id;
                    $stockChanges[$productId] = ($stockChanges[$productId] ?? 0) + $item->quantity;
                }
                
                // Then, subtract new quantities (positive change means stock decreases)
                foreach ($data['products'] as $newItem) {
                    $productId = $newItem['product_id'];
                    $stockChanges[$productId] = ($stockChanges[$productId] ?? 0) - $newItem['quantity'];
                }
                
                // Check if any product would go negative
                foreach ($stockChanges as $productId => $netChange) {
                    if ($netChange < 0) {
                        $product = Products::find($productId);
                        $availableStock = ($product->quantity - $product->sold) + ($originalItems->where('product_id', $productId)->sum('quantity') ?? 0);
                        $requestedQuantity = abs($netChange);
                        
                        if ($availableStock < $requestedQuantity) {
                            throw new \Exception("Insufficient stock for {$product->name}. Available: {$availableStock}, Requested: {$requestedQuantity}");
                        }
                    }
                }
            }

            // Restore original inventory before updating
            foreach ($originalItems as $item) {
                $product = Products::find($item->product_id);
                if ($product) {
                    $product->increment('quantity', $item->quantity);
                    $product->decrement('sold', $item->quantity);
                }
            }

            // Delete old items
            $paycheck->items()->delete();

            // Update basic info
            $updateData = [];
            if (isset($data['payment_type'])) {
                $updateData['payment_type'] = $data['payment_type'];
            }
            if (isset($data['transaction_id'])) {
                $updateData['transaction_id'] = $data['transaction_id'];
            }
            if (isset($data['payment_status'])) {
                $updateData['payment_status'] = $data['payment_status'];
            }
            
            if (!empty($updateData)) {
                $paycheck->update($updateData);
            }

            // Create new items if products provided
            if (isset($data['products']) && !empty($data['products'])) {
                foreach ($data['products'] as $item) {
                    // ✅ FINAL STOCK CHECK before creating
                    $product = Products::find($item['product_id']);
                    $availableStock = $product->quantity - $product->sold;
                    
                    if ($availableStock < $item['quantity']) {
                        throw new \Exception("Insufficient stock for {$product->name}. Available: {$availableStock}, Requested: {$item['quantity']}");
                    }
                    
                    if ($product->quantity <= 0) {
                        throw new \Exception("{$product->name} is out of stock.");
                    }
                    
                    // Create new product sold item
                    ProductSold::create([
                        'paycheck_id' => $paycheck->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'price_at_sale' => $item['price_at_sale'],
                    ]);
                    
                    // Update inventory with new quantities
                    $this->updateProductInventory($item['product_id'], $item['quantity']);
                }
            }

            DB::commit();
            
            // Load items with product details for response
            $paycheck->load('items.product');
            
            return $paycheck;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update paycheck: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a single product sold item
     */
    private function createProductSoldItem(int $paycheckId, array $itemData): void
    {
        ProductSold::create([
            'paycheck_id' => $paycheckId,
            'product_id' => $itemData['product_id'],
            'quantity' => $itemData['quantity'],
            'price_at_sale' => $itemData['price_at_sale'],
        ]);
    }

    /**
     * Update product inventory (decrease quantity, increase sold count)
     */
    public function updateProductInventory(int $productId, int $quantity): void
    {
        $product = Products::findOrFail($productId);
        $product->decrement('quantity', $quantity);
        $product->increment('sold', $quantity);
    }

    /**
     * Validate that a user exists and is active
     */
    public function validateActiveUser(int $userId): void
    {
        $user = User::where('id', $userId)
                    ->where('status', 'active')
                    ->exists();

        if (!$user) {
            throw new \Exception("User ID {$userId} is not active or does not exist.");
        }
    }

    /**
     * Get all paychecks with their items and products
     */
    public function getAllPaychecks()
    {
        return ProductPaycheck::with('items.product')->get();
    }

    /**
     * Get a single paycheck with its items and products
     */
    public function getPaycheckById(int $id)
    {
        return ProductPaycheck::with('items.product')->find($id);
    }

    public function deletePaycheck(int $paycheckId): bool
    {
        $paycheck = ProductPaycheck::with('items')->findOrFail($paycheckId);
        
        // Restore inventory FIRST
        foreach ($paycheck->items as $item) {
            $product = Products::find($item->product_id);
            if ($product) {
                $product->increment('quantity', $item->quantity);
                $product->decrement('sold', $item->quantity);
            }
        }
        
        // THEN delete the paycheck
        return $paycheck->delete();
    }

    /**
     * Get total revenue from all paychecks
     */
    public function getTotalRevenue(): float
    {
        $items = ProductSold::with('paycheck')
            ->whereHas('paycheck', function ($query) {
                $query->where('payment_status', 'paid');
            })
            ->get();
        
        $total = 0;
        foreach ($items as $item) {
            $total += $item->quantity * $item->price_at_sale;
        }
        
        return $total;
    }
}