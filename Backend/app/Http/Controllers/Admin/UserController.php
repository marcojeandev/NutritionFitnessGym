<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\UserCreateRequest;
use App\Http\Requests\Admin\UserUpdateRequest;
use App\Http\Requests\Admin\SystemAccountRequest;
use App\Http\Requests\Admin\UserApproveRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private \App\Services\RegisterService $registerService
    ) {}

    public function store(UserCreateRequest $request)
    {
        try {
            $this->authorize('create', User::class);
            $validated = $request->validated();
            
            $result = $this->registerService->register(
                $validated, 
                $request->hasFile('profile') ? $request->file('profile') : null
            );
            
            return response()->json([
                'status' => 'success',
                'message' => 'Registered Successfully.',
                'data' => [
                    'user' => new UserResource($result['user'])
                ],
            ], 201);
        } catch (\Throwable $e) {
           \Log::error('Failed' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Creating user failed. Please try again.',
            ], 500);
        }
    }

    public function update(UserUpdateRequest $request, User $user)
    {
        try {
            $this->authorize('update', $user);
            $validated = $request->validated();
            $validated["profile"] = $user->profile;
            $validated["icon"] = $user->icon;

            if ($request->hasFile('profile')) {
                if ($user->profile && Storage::disk('public')->exists($user->profile)) {
                    Storage::disk('public')->delete($user->profile);
                }
                $validated["profile"] = $request->file('profile')->store('profiles', 'public');
            }

            if ($request->hasFile('icon')) {
                if ($user->icon && Storage::disk('public')->exists($user->icon)) {
                    Storage::disk('public')->delete($user->icon);
                }
                $validated["icon"] = $request->file('icon')->store('icons', 'public');
            }

            $user->update($validated);

            if ($user->wasChanged('status') && $user->status !== 'active') {
                $user->tokens()->delete();
            }

            return response()->json([
                'status' => 1,
                'message' => $user->firstname . ' updated successfully.',
                'data' => new UserResource($user->fresh()),
            ], 200);
        } catch (\Throwable $e) {
           \Log::error('Failed' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Update user failed. Please try again.',
            ], 500);
        }
    }
    
    public function show(User $user)
    {
        try {
            $this->authorize('view', $user);

            return response()->json([
                'status' => 1,
                'message' => 'User fetched successfully.',
                'data' => new UserResource($user),
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('Failed' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch user data. Please try again.',
            ], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', User::class);

            $users = User::query()
                ->when($request->search, function ($query) use ($request) {
                    $query->where(function ($q) use ($request) {
                        $q->where('firstname', 'like', "%{$request->search}%")
                        ->orWhere('lastname', 'like', "%{$request->search}%")
                        ->orWhere('email', 'like', "%{$request->search}%")
                        ->orWhere('username', 'like', "%{$request->search}%");
                    });
                })
                ->when($request->role, function ($query) use ($request) {
                    $query->where('role', $request->role);
                })
                ->when($request->status, function ($query) use ($request) {
                    $query->where('status', $request->status);
                })
                ->paginate($request->per_page ?? 15);

            // Apply UserResource to the paginated collection
            $users->getCollection()->transform(function ($user) {
                return new UserResource($user);
            });

            return response()->json([
                'status' => 1,
                'message' => 'Users fetched successfully.',
                'data' => $users,
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('Failed' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch user data. Please try again.',
            ], 500);
        }
    }

    public function destroy(User $user)
    {
        try {
            $this->authorize('delete', $user);
            
            if ($user->profile && Storage::disk('public')->exists($user->profile)) {
                Storage::disk('public')->delete($user->profile);
            }

            if ($user->icon && Storage::disk('public')->exists($user->icon)) {
                Storage::disk('public')->delete($user->icon);
            }

            $name = $user->firstname . ' ' . $user->lastname;
            $user->delete(); 

            return response()->json([
                'status' => 1,
                'message' => 'User ' . $name . ' deleted successfully.',
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('Failed' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete user. Please try again.',
            ], 500);
        }
    }

    public function storeSystemAccount(SystemAccountRequest $request)
    {
        try {
            $this->authorize('create', User::class);
            
            if($request->role === 'cashier'){
                $user = User::createCashier(
                    $request->validated(),
                    $request->file('profile')
                );
            }else if($request->role === 'staff'){
                $user = User::createStaff(
                    $request->validated(),
                    $request->file('profile')
                );
            }
            
            
            return response()->json([
                'status' => 'success',
                'message' => 'Cashier registered successfully.',
                'data' => [
                    'user' => new UserResource($user)
                ],
            ], 201);
            
        } catch (\Throwable $e) {
            \Log::error('Failed to create cashier: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Creating cashier failed. Please try again.',
            ], 500);
        }
    }

    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => ['required', 'string', 'in:member,cashier,staff'], // NO admin
        ]);

        $this->authorize('updateRole', [$user, $request->role]);

        // Cannot change your own role
        if (auth('sanctum')->id() === $user->id) {
            return response()->json([
                'status' => 0,
                'message' => 'You cannot change your own role.',
            ], 403);
        }

        // Cannot change another admin's role
        if ($user->role === 'admin') {
            return response()->json([
                'status' => 0,
                'message' => 'Cannot change another admin\'s role.',
            ], 403);
        }

        $user->update(['role' => $request->role]);

        return response()->json([
            'status' => 1,
            'message' => 'Role updated successfully.',
        ]);
    }

    public function approveUser(UserApproveRequest $request, User $user)
    {
        try {
            $this->authorize('approve', $user);
            
            $qrCode = $this->generateQRCode($user);
            
            $user->status = 'active';
            $user->qr_code = $qrCode;
            $user->save();
            
            $validated = $request->validated();
            
            $validated["or_number"] = 'OR-' . strtoupper(uniqid()) . rand(1000, 9999);
            $validated["payment_status"] = 'paid';
            $validated["transaction_id"] = null;
            $validated["payment_amount"] = 150.00;
            
            $membership_fee = $user->membership_fee()->create([
                'user_id' => $user->id,
                'or_number' => $validated["or_number"],
                'payment_status' => $validated["payment_status"],
                'payment_amount' => $validated["payment_amount"],
                'payment_type' => $validated["payment_type"],
                'transaction_id' => $validated["transaction_id"]
            ]);
            
            return response()->json([
                'status' => 1,
                'message' => $user->firstname . ' approved successfully.',
                'data' => [
                    'user' => new UserResource($user->load('membership_fee'))
                ]
            ], 200);
            
        } catch (\Throwable $e) {
            \Log::error('User approval failed: ' . $e->getMessage());
            
            return response()->json([
                'status' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    private function generateQRCode(User $user): string
    {
        return 'QR-' . $user->id . '-' . strtoupper(Str::random(6));
    }
    public function disapproveUser(User $user)
    {
        $this->authorize('disapprove', $user);

        $user->status = 'archive';
        $user->save();  // ← Not update()

        return response()->json([
            'status' => 1,
            'message' => $user->firstname . ' approved successfully.',
        ]);
    }

    public function deactivateUser(User $user)
    {
        $this->authorize('inactive', $user);

        $user->status = 'inactive';
        $user->save();  // ← Not update()

        return response()->json([
            'status' => 1,
            'message' => $user->firstname . ' approved successfully.',
        ]);
    }

    public function archiveUser(User $user)
    {
        $this->authorize('archive', $user);

        $user->status = 'archive';
        $user->save();  // ← Not update()

        return response()->json([
            'status' => 1,
            'message' => $user->firstname . ' approved successfully.',
        ]);
    }
}