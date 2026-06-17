<?php

namespace App\Policies;

use App\Models\Trainer;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TrainerPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'cashier']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Trainer $trainer): bool
    {
        return in_array($user->role, ['admin', 'cashier']);
        return $user->role === 'member' && $user->id == $model->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'cashier']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Trainer $trainer): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Trainer $trainer): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Trainer $trainer): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Trainer $trainer): bool
    {
        return false;
    }
}
