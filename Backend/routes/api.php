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
    Route::apiResource('admin/users', AdminUserController::class)->names([
        'index'   => 'admin.users.index',
        'store'   => 'admin.users.store',
        'show'    => 'admin.users.show',
        'update'  => 'admin.users.update',
        'destroy' => 'admin.users.destroy',
    ]);
    Route::post('admin/users/systemAccount', [AdminUserController::class, 'storeSystemAccount']);
    Route::patch('admin/users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::patch('admin/users/{user}/approve', [AdminUserController::class, 'approveUser']);
    Route::patch('admin/users/{user}/deactivate', [AdminUserController::class, 'deactivateUser']);
    Route::patch('admin/users/{user}/archive', [AdminUserController::class, 'archiveUser']);

    // Contract Management
    Route::apiResource('admin/contracts', AdminContractController::class)->names([
        'index'   => 'admin.contracts.index',
        'store'   => 'admin.contracts.store',
        'show'    => 'admin.contracts.show',
        'update'  => 'admin.contracts.update',
        'destroy' => 'admin.contracts.destroy',
    ]);

    // Walk-in Management
    Route::apiResource('admin/walkins', AdminWalkInInfoController::class)->names([
        'index'   => 'admin.walkins.index',
        'store'   => 'admin.walkins.store',
        'show'    => 'admin.walkins.show',
        'update'  => 'admin.walkins.update',
        'destroy' => 'admin.walkins.destroy',
    ]);
    Route::apiResource('admin/walkins-attendance', AdminWalkInAttendanceController::class)->names([
        'index'   => 'admin.walkins-attendance.index',
        'store'   => 'admin.walkins-attendance.store',
        'show'    => 'admin.walkins-attendance.show',
        'update'  => 'admin.walkins-attendance.update',
        'destroy' => 'admin.walkins-attendance.destroy',
    ]);

    // Products Management
    Route::apiResource('admin/products', AdminProductController::class)->names([
        'index'   => 'admin.products.index',
        'store'   => 'admin.products.store',
        'show'    => 'admin.products.show',
        'update'  => 'admin.products.update',
        'destroy' => 'admin.products.destroy',
    ]);

    // Products Paycheck Management
    Route::apiResource('admin/products-paycheck', AdminProductPaycheckController::class)->names([
        'index'   => 'admin.products-paycheck.index',
        'store'   => 'admin.products-paycheck.store',
        'show'    => 'admin.products-paycheck.show',
        'update'  => 'admin.products-paycheck.update',
        'destroy' => 'admin.products-paycheck.destroy',
    ]);

    // Reports Management
    Route::apiResource('admin/reports', AdminReportController::class)->names([
        'index'   => 'admin.reports.index',
        'store'   => 'admin.reports.store',
        'show'    => 'admin.reports.show',
        'update'  => 'admin.reports.update',
        'destroy' => 'admin.reports.destroy',
    ]);

    // Trainer Management
    Route::apiResource('admin/trainers', AdminTrainerController::class)->names([
        'index'   => 'admin.trainers.index',
        'store'   => 'admin.trainers.store',
        'show'    => 'admin.trainers.show',
        'update'  => 'admin.trainers.update',
        'destroy' => 'admin.trainers.destroy',
    ]);

    // Attendance Management
    Route::apiResource('admin/attendance', AdminAttendanceController::class)->names([
        'index'   => 'admin.attendance.index',
        'store'   => 'admin.attendance.store',
        'show'    => 'admin.attendance.show',
        'update'  => 'admin.attendance.update',
        'destroy' => 'admin.attendance.destroy',
    ]);

    // Reservation Management
    Route::apiResource('admin/reservations', AdminReservationController::class)->names([
        'index'   => 'admin.reservations.index',
        'store'   => 'admin.reservations.store',
        'show'    => 'admin.reservations.show',
        'update'  => 'admin.reservations.update',
        'destroy' => 'admin.reservations.destroy',
    ]);
});

// ── Cashier Routes (Cashier role only) ─────────────
Route::middleware(['auth:sanctum', 'cashier', 'active', 'throttle:60,1'])->group(function () {
    // User Management
    Route::apiResource('cashier/users', CashierUserController::class)->names([
        'index'   => 'cashier.users.index',
        'store'   => 'cashier.users.store',
        'show'    => 'cashier.users.show',
        'update'  => 'cashier.users.update',
        'destroy' => 'cashier.users.destroy',
    ]);
    Route::post('cashier/users/systemAccount', [CashierUserController::class, 'storeSystemAccount']);
    Route::patch('cashier/users/{user}/approve', [CashierUserController::class, 'approveUser']);
    Route::patch('cashier/users/{user}/deactivate', [CashierUserController::class, 'deactivateUser']);

    // Contract Management
    Route::apiResource('cashier/contracts', CashierContractController::class)->names([
        'index'   => 'cashier.contracts.index',
        'store'   => 'cashier.contracts.store',
        'show'    => 'cashier.contracts.show',
        'update'  => 'cashier.contracts.update',
        'destroy' => 'cashier.contracts.destroy',
    ]);

    // Walk-in Management
    Route::apiResource('cashier/walkins', CashierWalkInInfoController::class)->names([
        'index'   => 'cashier.walkins.index',
        'store'   => 'cashier.walkins.store',
        'show'    => 'cashier.walkins.show',
        'update'  => 'cashier.walkins.update',
        'destroy' => 'cashier.walkins.destroy',
    ]);
    Route::apiResource('cashier/walkins-attendance', CashierWalkInAttendanceController::class)->names([
        'index'   => 'cashier.walkins-attendance.index',
        'store'   => 'cashier.walkins-attendance.store',
        'show'    => 'cashier.walkins-attendance.show',
        'update'  => 'cashier.walkins-attendance.update',
        'destroy' => 'cashier.walkins-attendance.destroy',
    ]);

    // Products Paycheck Management
    Route::apiResource('cashier/products-paycheck', CashierProductPaycheckController::class)->names([
        'index'   => 'cashier.products-paycheck.index',
        'store'   => 'cashier.products-paycheck.store',
        'show'    => 'cashier.products-paycheck.show',
        'update'  => 'cashier.products-paycheck.update',
        'destroy' => 'cashier.products-paycheck.destroy',
    ]);
});