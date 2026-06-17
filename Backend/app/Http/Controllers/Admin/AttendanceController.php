<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AttendanceRequest;
use App\Models\Attendance;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\AttendanceResource;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    use AuthorizesRequests;  
    
    public function index()
    {
        try {
            $this->authorize('viewAny', Attendance::class);
            
            $attendances = Attendance::with('user')->get();

            return response()->json([
                'status' => 1,
                'message' => 'Attendances fetched successfully.',
                'data' => $attendances,
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch attendances.',
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $attendance = Attendance::with('user')->findOrFail($id);
            $this->authorize('view', $attendance);

            return response()->json([
                'status' => 1,
            'message' => 'Attendance fetched successfully.',
            'data' => $attendance,
        ], 200);

    } catch (\Throwable $e) {
        return response()->json([
            'status' => 0,
            'message' => 'Attendance not found.',
        ], 404);
    }
}
    public function store(AttendanceRequest $request)
    {
        try {
            // Authorization
            $this->authorize('create', Attendance::class);

            $user = User::find($request->user_id);

            // Check if checking in or out
            if ($request->time_out) {
                // CHECK OUT - Find today's attendance with no time_out
                $attendance = Attendance::where('user_id', $user->id)
                    ->whereDate('created_at', now()->toDateString())
                    ->whereNull('time_out')
                    ->first();

                if (!$attendance) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'No active check-in found for today.',
                    ], 422);
                }

                // Update with time_out
                $attendance->update([
                    'time_out' => $request->time_out,
                ]);

                return response()->json([
                    'status' => 1,
                    'message' => 'Check-out recorded successfully.',
                    'data' => new AttendanceResource($attendance),
                ], 200);

            } else {
                // CHECK IN - Create new attendance
                $attendance = Attendance::create([
                    'user_id' => $user->id,
                    'time_in' => $request->time_in,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return response()->json([
                    'status' => 1,
                    'message' => 'Check-in recorded successfully.',
                    'data' => new AttendanceResource($attendance),
                ], 201);
            }

        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'status' => 0,
                'message' => 'You are not authorized to record attendance.',
            ], 403);
        } catch (\Throwable $e) {
            Log::error('Attendance recording failed: ' . $e->getMessage(), [
                'user_id' => $request->user_id ?? null,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Failed to record attendance: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function today()
    {
        try {
            $this->authorize('viewAny', Attendance::class);

            $attendances = Attendance::with('user')
                ->whereDate('created_at', now()->toDateString())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 1,
                'data' => AttendanceResource::collection($attendances),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch today\'s attendance: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch attendance.',
            ], 500);
        }
    }

    public function update(AttendanceRequest $request, $id)
    {
        try {
            $attendance = Attendance::findOrFail($id);
            $this->authorize('update', $attendance); 

            $attendance->update([
                'time_out' => $request->time_out,
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Time out recorded successfully.',
                'data' => $attendance,
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update attendance.',
            ], 500);
        }
    }
}