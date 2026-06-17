<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Reservation;
use App\Http\Requests\Admin\ReservationRequest;

class ReservationController extends Controller
{
    use AuthorizesRequests;
    
    public function index(){
        try {
            $this->authorize('viewAny', Reservation::class);
            $reservation = Reservation::all();
            return response()->json([
                'status' => 1,
                'message' => 'reservation datas fetched successfully.',
                'data' => $reservation,
            ],200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch trainers.',
            ], 500);
        }
    }

    public function store(ReservationRequest $request){
        try {
            $validated = $request->validated();
            $this->authorize('create', Reservation::class);

            $reservations = Reservation::create($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Reservation created successfully.',
                'data' => $reservations,
            ],201);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch trainers.',
            ], 500);
        }
    }

    public function update(ReservationRequest $request, $id){
        try {
            $reservation = Reservation::findOrFail($id);
            $validated = $request->validated();
            $this->authorize('update', $reservation);

            $reservation->update($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Reservation updated successfully.',
                'data' => $reservation,
            ],200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to updated reservation. ' . $e->getMessage(),
            ], 500);
        }
    }
}
