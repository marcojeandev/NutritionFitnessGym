<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalkInInfoResource;
use App\Models\WalkInInfo;
use App\Http\Requests\Admin\WalkInInfoCreateRequest;
use App\Http\Requests\Admin\WalkIninfoUpdate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class WalkInInfoController extends Controller
{
    use AuthorizesRequests;
    
    public function index()
    {
        try {
            $this->authorize('viewAny', WalkInInfo::class);
            $walkins = WalkInInfo::all();
            
            return response()->json([
                'status' => 1,
                'message' => 'walk-in applicants fetch successfully!',
                'data' => WalkInInfoResource::collection($walkins),
            ], 200); // 200 not 201
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch walk-in data. Please try again.',
            ], 500);
        }
    }

    public function store(WalkInInfoCreateRequest $request)
    {
        try {
            $validated = $request->validated();
            $this->authorize('create', WalkInInfo::class);

            $walkin = WalkInInfo::create($validated);

            return response()->json([
                'status' => 1,
                'message' => 'walk-in applicant created successfully!',
                'data' => new WalkInInfoResource($walkin),
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create walk-in data. Please try again.',
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $walkInInfo = WalkInInfo::find($id);
            
            if (!$walkInInfo) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Walk-in applicant not found.',
                ], 404);
            }
            
            $this->authorize('view', $walkInInfo);
            
            return response()->json([
                'status' => 1,
                'message' => $walkInInfo->firstname . ': walk-in applicant fetched successfully!',
                'data' => new WalkInInfoResource($walkInInfo),
            ], 200);
            
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch walk-in data. Please try again.',
            ], 500);
        }
    }

    public function update(WalkIninfoUpdate $request, $id)
    {
        try {
            $walkInInfo = WalkInInfo::findOrFail($id);
            
            $this->authorize('update', $walkInInfo);
            
            $walkInInfo->update($request->validated());

            return response()->json([
                'status' => 1,
                'message' => $walkInInfo->firstname . ': walk-in applicant updated successfully!',
                'data' => new WalkInInfoResource($walkInInfo->fresh()),
            ], 200);
            
        } catch (\Throwable $e) {
            \Log::error('Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update walk-in data. Please try again.',
            ], 500);
        }
    }
}