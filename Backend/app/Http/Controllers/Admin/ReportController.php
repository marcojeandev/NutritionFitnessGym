<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReportCreateRequest;
use App\Http\Requests\Admin\ReportUpdateRequest;
use App\Models\Report;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\ReportResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ReportController extends Controller
{
    use AuthorizesRequests;

    public function store(ReportCreateRequest $request)
    {
        try {
            $validated = $request->validated();
            $this->authorize('create', Report::class);

            $report = DB::transaction(function () use ($validated) {
                $report = Report::create($validated);
                
                foreach ($validated['files'] ?? [] as $file) {
                    $report->files()->create($file);
                }
                
                return $report;
            });

            return response()->json([
                'status' => 1,
                'message' => 'Report created successfully.',
                'data' => new ReportResource($report->load('files', 'user')),
            ], 201);

        } catch (\Throwable $e) {
            Log::error('Report creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create report. Please try again.',
            ], 500);
        }
    }

    public function update(ReportUpdateRequest $request, $id)
    {
        try {
            $report = Report::findOrFail($id);
            $this->authorize('update', $report);
            $validated = $request->validated();
            
            $report->update([
                'report_type' => $validated['report_type'] ?? $report->report_type,
                'title' => $validated['title'] ?? $report->title,
                'description' => $validated['description'] ?? $report->description,
            ]);
            
            if (isset($validated['files'])) {
                $report->files()->delete();
                foreach ($validated['files'] as $file) {
                    $report->files()->create($file);
                }
            }
            
            return response()->json([
                'status' => 1,
                'message' => 'Report updated successfully.',
                'data' => new ReportResource($report->load('files', 'user')),
            ], 200);
            
        } catch (\Throwable $e) {
            Log::error('Report update failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update report. Please try again.',
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $report = Report::findOrFail($id);
            $this->authorize('delete', $report);
            
            $report->files()->delete();
            $report->delete();
            
            return response()->json([
                'status' => 1,
                'message' => 'Report deleted successfully.',
            ], 200);
            
        } catch (\Throwable $e) {
            Log::error('Report deletion failed: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete report. Please try again.',
            ], 500);
        }
    }
}