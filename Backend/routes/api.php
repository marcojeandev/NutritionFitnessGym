<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Resources\UserResource;

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
use App\Http\Controllers\Admin\EquipmentController as AdminEquipmentController;

// Cashier Controllers
use App\Http\Controllers\Cashier\UserController as CashierUserController;
use App\Http\Controllers\Cashier\ContractController as CashierContractController;
use App\Http\Controllers\Cashier\WalkInInfoController as CashierWalkInInfoController;
use App\Http\Controllers\Cashier\WalkInAttendanceController as CashierWalkInAttendanceController;
use App\Http\Controllers\Cashier\ProductPaycheckController as CashierProductPaycheckController;

// ── Public Routes ──────────────────────────────
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// ── Authenticated Routes ──────────────────────
Route::middleware(['auth:sanctum', 'active', 'throttle:60,1'])->group(function () {
    Route::get('/user', function (Request $request) {
        return new UserResource(
            $request->user()->load(['membership_fee', 'contract.payment'])
        );
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// ── Admin Routes ──────────────────────────────
Route::middleware(['auth:sanctum', 'admin', 'active', 'throttle:60,1'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::apiResource('users', AdminUserController::class);
        Route::post('users/systemAccount', [AdminUserController::class, 'storeSystemAccount']);
        Route::patch('users/{user}/role', [AdminUserController::class, 'updateRole']);
        Route::patch('users/{user}/approve', [AdminUserController::class, 'approveUser']);
        Route::patch('users/{user}/deactivate', [AdminUserController::class, 'deactivateUser']);
        Route::patch('users/{user}/archive', [AdminUserController::class, 'archiveUser']);

        Route::apiResource('contracts', AdminContractController::class);
        Route::apiResource('walkins', AdminWalkInInfoController::class);
        Route::apiResource('walkins-attendance', AdminWalkInAttendanceController::class);
        Route::apiResource('products', AdminProductController::class);
        Route::apiResource('products-paycheck', AdminProductPaycheckController::class);
        Route::apiResource('reports', AdminReportController::class);
        Route::apiResource('trainers', AdminTrainerController::class);
        Route::apiResource('attendance', AdminAttendanceController::class);
        Route::apiResource('reservations', AdminReservationController::class);
        Route::apiResource('equipments', AdminEquipmentController::class);
    });

// ── Cashier Routes ──────────────────────────────
Route::middleware(['auth:sanctum', 'cashier', 'active', 'throttle:60,1'])
    ->prefix('cashier')
    ->name('cashier.')
    ->group(function () {
        Route::apiResource('users', CashierUserController::class);
        Route::post('users/systemAccount', [CashierUserController::class, 'storeSystemAccount']);
        Route::patch('users/{user}/approve', [CashierUserController::class, 'approveUser']);
        Route::patch('users/{user}/deactivate', [CashierUserController::class, 'deactivateUser']);

        Route::apiResource('contracts', CashierContractController::class);
        Route::apiResource('walkins', CashierWalkInInfoController::class);
        Route::apiResource('walkins-attendance', CashierWalkInAttendanceController::class);
        Route::apiResource('products-paycheck', CashierProductPaycheckController::class);
    });