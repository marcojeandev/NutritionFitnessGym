<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'cashier']);
    }

    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'cashier']);
    }

    public function viewSensitive(User $user, User $model): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->id === $model->id;
    }

    public function approve(User $user, User $model): bool
    {
        if ($user->role === 'admin') return true;
        if ($user->role === 'cashier') return $model->role === 'member';
        return false;
    }

    public function update(User $user, User $model): bool
    {
        // Admin can update anyone
        if ($user->role === 'admin') {
            return true;
        }
        
        // Cashier can only update members (not admins or other cashiers)
        if ($user->role === 'cashier') {
            // Can update themselves OR any member
            return $user->id === $model->id || $model->role === 'member';
        }
        
        // Member can only update their own profile
        if ($user->role === 'member') {
            return $user->id === $model->id;
        }
        
        return false;
    }

    public function delete(User $user, User $model): bool
    {
        return $user->role === 'admin';
    }

    public function updateRole(User $user, User $model, string $newRole = null): bool
    {
        $allowedRoles = ['member', 'cashier']; // cannot become admin
        if ($newRole && !in_array($newRole, $allowedRoles)) {
            return false;
        }
        return $user->role === 'admin' && $user->id !== $model->id;
    }

    public function archive(User $user, User $model){
        return $user->role === 'admin';

        return $user->role === 'admin' && $user->id !== $model->id;
    }

    public function inactive(){
        return in_array($user->role, ['admin', 'cashier']);
    }
}

