<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\TrainerRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Trainer;

class TrainerController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        try {
            $this->authorize('viewAny', Trainer::class);
            $trainers = Trainer::all();

            return response()->json([
                'status' => 1,
                'message' => 'Trainers fetched successfully.',
                'data' => $trainers,
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch trainers.',
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $trainer = Trainer::findOrFail($id);
            $this->authorize('view', $trainer);

            return response()->json([
                'status' => 1,
                'message' => 'Trainer fetched successfully.',
                'data' => $trainer,
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Trainer not found.',
            ], 404);
        }
    }

    public function store(TrainerRequest $request)
    {
        try {
            $validated = $request->validated();
            $this->authorize('create', Trainer::class);

            $trainer = Trainer::create($validated);

            return response()->json([
                'status' => 1,
                'message' => $trainer->firstname . ' ' . $trainer->lastname . ' has been successfully created.',
                'data' => $trainer,
            ], 201); // 201 = Created

        } catch (\Throwable $e) {
            \Log::error('Trainer creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create trainer data. Please try again. ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(TrainerRequest $request, $id)
    {
        try {
            $trainer = Trainer::findOrFail($id);
            $this->authorize('update', $trainer);

            $validated = $request->validated();
            $trainer->update($validated);

            return response()->json([
                'status' => 1,
                'message' => $trainer->firstname . ' ' . $trainer->lastname . ' has been successfully updated.',
                'data' => $trainer,
            ], 200);

        } catch (\Throwable $e) {
            \Log::error('Trainer update failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update trainer data. Please try again.',
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $trainer = Trainer::findOrFail($id);
            $this->authorize('delete', $trainer);

            $trainer->delete();

            return response()->json([
                'status' => 1,
                'message' => $trainer->firstname . ' ' . $trainer->lastname . ' has been successfully deleted.',
            ], 200);

        } catch (\Throwable $e) {
            \Log::error('Trainer deletion failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete trainer data. Please try again.',
            ], 500);
        }
    }
}