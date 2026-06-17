<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
// Admin Controllers
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\ContractController as AdminContractController;
use App\Http\Controllers\Admin\WalkInInfoController as AdminWalkInInfoController;
use App\Http\Controllers\Admin\WalkInAttendanceController as AdminWalkInAttendanceController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ProductPaycheckController as AdminProductPaycheckController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\TrainerController as AdminTrainerController;
use App\Http\Controllers\Admin\AttendanceController as AdminAttendanceController;
use App\Http\Controllers\Admin\ReservationController as AdminReservationController;
// Cashier Controllers
use App\Http\Controllers\Cashier\UserController as CashierUserController;
use App\Http\Controllers\Cashier\ContractController as CashierContractController;
use App\Http\Controllers\Cashier\WalkInInfoController as CashierWalkInInfoController;
use App\Http\Controllers\Cashier\WalkInAttendanceController as CashierWalkInAttendanceController;
use App\Http\Controllers\Cashier\ProductController as CashierProductController;
use App\Http\Controllers\Cashier\ProductPaycheckController as CashierProductPaycheckController;
use App\Http\Resources\UserResource;

// ── Public Routes ──────────────────────────────
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:5,1');

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

// ── Authenticated Routes (any logged-in user) ──
Route::middleware(['auth:sanctum', 'active', 'throttle:60,1'])->group(function () {
    Route::get('/user', function (Request $request) {
        return new UserResource(
            $request->user()->load([
                'membership_fee', 
                'contract.payment'  
            ])
        );
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// ── Admin Routes (admin role only) ─────────────
Route::middleware(['auth:sanctum', 'admin', 'active', 'throttle:60,1'])->group(function () {
    // User Management
    Route::apiResource('admin/users', AdminUserController::class);
    Route::post('admin/users/systemAccount', [AdminUserController::class, 'storeSystemAccount']); 
    Route::patch('admin/users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::patch('admin/users/{user}/approve', [AdminUserController::class, 'approveUser']);
    Route::patch('admin/users/{user}/deactivate', [AdminUserController::class, 'deactivateUser']);
    Route::patch('admin/users/{user}/archive', [AdminUserController::class, 'archiveUser']);
    
    // Contract Management
    Route::apiResource('admin/contracts', AdminContractController::class);

    // Walk-in Management
    Route::apiResource('admin/walkins', AdminWalkInInfoController::class);

    // Walk-in Management 
    Route::apiResource('admin/walkins-attendance', AdminWalkInAttendanceController::class);

    // Products Management 
    Route::apiResource('admin/products', AdminProductController::class);

    // Products paycheck Management 
    Route::apiResource('admin/products-paycheck', AdminProductPaycheckController::class);

    // Reports Management 
    Route::apiResource('admin/reports', AdminReportController::class);

    // Trainer Management 
    Route::apiResource('admin/trainers', AdminTrainerController::class);

    // Trainer Management 
    Route::apiResource('admin/attendance',  AdminAttendanceController::class);

    // Trainer Management 
    Route::apiResource('admin/reservations',  AdminReservationController::class);
});

// ── Cashier Routes (Cashier role only) ─────────────
Route::middleware(['auth:sanctum', 'cashier', 'active', 'throttle:60,1'])->group(function () {
    // User Management
    Route::apiResource('cashier/users', CashierUserController::class);
    Route::post('cashier/users/systemAccount', [CashierUserController::class, 'storeSystemAccount']); 
    Route::patch('cashier/users/{user}/approve', [CashierUserController::class, 'approveUser']);
    Route::patch('cashier/users/{user}/deactivate', [CashierUserController::class, 'deactivateUser']);
    
    // Contract Management
    Route::apiResource('cashier/contracts', CashierContractController::class);

    // Walk-in Management
    Route::apiResource('cashier/walkins', CashierWalkInInfoController::class);

    // Walk-in Management 
    Route::apiResource('cashier/walkins-attendance', CashierWalkInAttendanceController::class);

    // Products Management 
    // Route::apiResource('cashier/products', CashierProductController::class);

    // Products paycheck Management 
    Route::apiResource('cashier/products-paycheck', CashierProductPaycheckController::class);

    // Reports Management 
    // Route::apiResource('cashier/reports', CashierReportController::class);
});