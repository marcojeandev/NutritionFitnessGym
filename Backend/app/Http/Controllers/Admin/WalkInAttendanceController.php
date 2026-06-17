<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalkInAttendanceResource;
use App\Models\WalkInAttendance;
use App\Http\Requests\Admin\WalkInAttendanceRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class WalkInAttendanceController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        try {
            $this->authorize('viewAny', WalkInAttendance::class);
            $walkins = WalkInAttendance::all();
            
            return response()->json([
                'status' => 1,
                'message' => 'walk-in attendance fetch successfully!',
                'data' => WalkInAttendanceResource::collection($walkins),
            ], 200); // 200 not 201
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch walk-in data. Please try again.',
            ], 500);
        }
    }

    public function store(WalkInAttendanceRequest $request)
    {
        try {
            $validated = $request->validated();
            
            // Check if this walk-in user already checked in today
            $existing = WalkInAttendance::where('walk_in_id', $validated['walk_in_id'])
                ->whereDate('time_in', now()->toDateString())
                ->exists();
            
            if ($existing) {
                return response()->json([
                    'status' => 0,
                    'message' => 'This user already checked in today.'
                ], 422);
            }
            
            $validated['time_in'] = now();
            $this->authorize('create', WalkInAttendance::class);
            $walkins = WalkInAttendance::create($validated);
            
            return response()->json([
                'status' => 1,
                'message' => 'walk-in attendance created successfully!',
                'data' => new WalkInAttendanceResource($walkins),
            ], 201);
            
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create walk-in attendance. Please try again.',
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $walkInAttendance = WalkInAttendance::findOrFail($id);
            
            $this->authorize('view', $walkInAttendance);

            return response()->json([
                'status' => 1,
                'message' => 'walk-in attendance fetched successfully!',
                'data' => new WalkInAttendanceResource($walkInAttendance),
            ], 200);
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch walk-in attendance. Please try again.',
            ], 500);
        }
    }
}