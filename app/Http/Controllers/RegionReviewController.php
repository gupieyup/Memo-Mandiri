<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Area;
use App\Models\Category;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RegionReviewController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get filter parameters
        $statusFilter = $request->input('status');
        $categoryFilter = $request->input('category_id');
        $areaFilter = $request->input('area_id');
        $searchQuery = $request->input('search');
        $perPage = $request->input('per_page', 10); // Default 10 items per page
        
        // Build query
        $query = Document::with(['area', 'category', 'user', 'feedbacks.user']);
        
        // Filter by status - AMO Region sees all documents except Draft
        $query->where('status', '!=', 'Draft');
        
        // Filter by managed areas (UserAreaResponsibility)
        // STRICT: Checking Uploader's Area, not just Document's Area (though provided they should match)
        // "dokumen yang diunggah oleh user amo area dengan area yang terkait"
        $managedAreaIds = $user->areaResponsibilities()->pluck('area_id')->toArray();
        
        $query->whereHas('user', function ($q) use ($managedAreaIds) {
            $q->where('role', 'AMO Area');
            
            if (!empty($managedAreaIds)) {
                $q->whereIn('area_id', $managedAreaIds);
            } else {
                $q->whereNull('id'); // Force fail if no managed areas
            }
        });
        
        // Apply search filter if provided
        if ($searchQuery) {
            $query->where('judul', 'like', '%' . $searchQuery . '%');
        }
        
        // Apply status filter if provided
        if ($statusFilter) {
            $query->where('status', $statusFilter);
        }
        
        // Filter by area if provided
        if ($areaFilter && $areaFilter !== 'all') {
            $query->where('area_id', $areaFilter);
        }
        
        // Filter by category if provided
        if ($categoryFilter && $categoryFilter !== 'all') {
            $query->where('category_id', $categoryFilter);
        }
        
        // Get documents ordered by latest with pagination
        $documents = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Get all areas and categories for filters, excluding "Region"
        // Only show managed areas in the filter dropdown
        $areasQuery = Area::select('id', 'nama')->where('nama', '!=', 'Region');
        
        if (!empty($managedAreaIds)) {
            $areasQuery->whereIn('id', $managedAreaIds);
        }
        
        $areas = $areasQuery->get();
        $categories = Category::select('id', 'nama')->get();
        
        // Get all unique statuses for filter dropdown (AMO Region specific statuses)
        $statuses = [
            'On Process',
            'Revision by AMO Region',
            'Reject by AMO Region',
            'Accept by AMO Region',
            'Accept by MO',
            'Reject by MO',
            'Accept by CCH',
            'Reject by CCH'
        ];
        
        return Inertia::render("AMO Region/Review/page", [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'role' => $user->role,
                    'area' => $user->area ? [
                        'id' => $user->area->id,
                        'name' => $user->area->nama,
                    ] : null,
                ]
            ],
            'documents' => $documents,
            'areas' => $areas,
            'categories' => $categories,
            'statuses' => $statuses,
            'filters' => [
                'area_id' => $areaFilter,
                'category_id' => $categoryFilter,
                'status' => $statusFilter,
                'search' => $searchQuery,
                'per_page' => $perPage,
            ]
        ]);
    }
    
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Accept by AMO Region,Reject by AMO Region',
            'notes' => 'nullable|string',
        ]);
        
        $document = Document::findOrFail($id);
        
        // Check if document is from user with role "AMO Area"
        if ($document->user->role !== 'AMO Area') {
            abort(403, 'Unauthorized access');
        }
        
        $user = Auth::user();
        
        // Check if document belongs to a managed area (via Uploader)
        $managedAreaIds = $user->areaResponsibilities()->pluck('area_id')->toArray();
        if (!in_array($document->user->area_id, $managedAreaIds)) {
            abort(403, 'Unauthorized access to this area');
        }
        
        // Only allow editing if status is "On Process"
        if ($document->status !== 'On Process') {
            return redirect()->back()->with('error', 'Dokumen hanya dapat diedit saat status On Process');
        }
        
        // Update document status
        $document->status = $request->status;
        
        // Update notes if provided
        if ($request->filled('notes')) {
            $document->notes = $request->notes;
        }
        
        $document->save();
        
        // Create feedback record
        if ($request->filled('notes')) {
            Feedback::create([
                'message' => $request->notes,
                'user_id' => $user->id,
                'document_id' => $document->id,
            ]);
        }
        
        return redirect()->back()->with('success', 'Review dokumen berhasil disimpan');
    }
    
    public function download($id)
    {
        $document = Document::findOrFail($id);
        
        // Check if document belongs to a managed area (via Uploader)
        $user = Auth::user();
        $managedAreaIds = $user->areaResponsibilities()->pluck('area_id')->toArray();
        if (!in_array($document->user->area_id, $managedAreaIds)) {
            abort(403, 'Unauthorized access to this area');
        }

        // Check if document is from user with role "AMO Area"
        if ($document->user->role !== 'AMO Area') {
            abort(403, 'Unauthorized access');
        }
        
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'File not found');
        }
        
        // Get the correct extension
        $extension = pathinfo($document->file_name, PATHINFO_EXTENSION);
        
        // Set proper content type based on file extension
        $contentType = match($extension) {
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            default => 'application/octet-stream',
        };
        
        return response()->download($filePath, $document->file_name, [
            'Content-Type' => $contentType,
        ]);
    }

    public function preview($id)
    {
        $document = Document::findOrFail($id);
        
        // AMO Region can preview documents that are not Draft
        if ($document->status === 'Draft') {
            abort(403, 'Document is not available for preview');
        }
        
        // Check if document belongs to a managed area (via Uploader)
        $user = Auth::user();
        $managedAreaIds = $user->areaResponsibilities()->pluck('area_id')->toArray();
        if (!in_array($document->user->area_id, $managedAreaIds)) {
            abort(403, 'Unauthorized access to this area');
        }

        // Check if document is from user with role "AMO Area"
        if ($document->user->role !== 'AMO Area') {
            abort(403, 'Document is not available for preview');
        }
        
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found');
        }
        
        // Get the correct extension
        $extension = pathinfo($document->file_name, PATHINFO_EXTENSION);
        
        // Set proper content type based on file extension
        $contentType = match($extension) {
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            default => 'application/octet-stream',
        };
        
        return response()->file($filePath, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'inline; filename="' . $document->file_name . '"',
        ]);
    }
}