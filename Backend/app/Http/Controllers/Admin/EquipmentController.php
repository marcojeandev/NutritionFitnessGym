<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EquipmentRequest;
use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of equipment.
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Equipment::class);

            $equipments = Equipment::query()
                ->when($request->search, function ($query) use ($request) {
                    $query->where('equipment_name', 'like', "%{$request->search}%")
                        ->orWhere('brand', 'like', "%{$request->search}%")
                        ->orWhere('category', 'like', "%{$request->search}%");
                })
                ->when($request->status, function ($query) use ($request) {
                    $query->where('status', $request->status);
                })
                ->when($request->category, function ($query) use ($request) {
                    $query->where('category', $request->category);
                })
                ->latest()
                ->paginate($request->per_page ?? 15);

            return response()->json([
                'status' => 1,
                'message' => 'Equipment data retrieved successfully.',
                'data' => EquipmentResource::collection($equipments),
                'meta' => [
                    'current_page' => $equipments->currentPage(),
                    'per_page' => $equipments->perPage(),
                    'total' => $equipments->total(),
                    'last_page' => $equipments->lastPage(),
                ],
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve equipment data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified equipment.
     */
    public function show($id)
    {
        try {
            $equipment = Equipment::findOrFail($id);
            $this->authorize('view', $equipment);

            return response()->json([
                'status' => 1,
                'message' => 'Equipment data retrieved successfully.',
                'data' => new EquipmentResource($equipment),
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Equipment not found.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve equipment data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created equipment.
     */
    public function store(EquipmentRequest $request)
    {
        try {
            $validated = $request->validated();
            $this->authorize('create', Equipment::class);

            $validated["equipment_image"] = $request->hasFile('equipment_image') ?
                $request->file('equipment_image')->store('equipments', 'public') : null;

            $equipment = Equipment::create($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Successfully created equipment data.',
                'data' => new EquipmentResource($equipment),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create equipment data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified equipment.
     */
    public function update(EquipmentRequest $request, $id)
    {
        try {
            $equipment = Equipment::findOrFail($id);
            $validated = $request->validated();
            
            $this->authorize('update', $equipment);

            if ($request->hasFile('equipment_image')) {
                if ($equipment->equipment_image && Storage::disk('public')->exists($equipment->equipment_image)) {
                    Storage::disk('public')->delete($equipment->equipment_image);
                }
                $validated["equipment_image"] = $request->file('equipment_image')->store('equipments', 'public');
            }

            $equipment->update($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Successfully updated equipment data.',
                'data' => new EquipmentResource($equipment),
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Equipment not found.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update equipment data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified equipment.
     */
    public function destroy($id)
    {
        try {
            $equipment = Equipment::findOrFail($id);
            $this->authorize('delete', $equipment);

            // Delete the image if exists
            if ($equipment->equipment_image && Storage::disk('public')->exists($equipment->equipment_image)) {
                Storage::disk('public')->delete($equipment->equipment_image);
            }

            $equipment->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Equipment deleted successfully.',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Equipment not found.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete equipment data: ' . $e->getMessage(),
            ], 500);
        }
    }


}