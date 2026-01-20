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

class CCHReviewController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get filter parameters
        $statusFilter = $request->input('status');
        $categoryFilter = $request->input('category_id');
        $areaFilter = $request->input('area_id');
        $searchQuery = $request->input('search');
        $perPage = $request->input('per_page', 10);
        
        // Build query
        $query = Document::with(['area', 'category', 'user', 'feedbacks.user']);
        
        // Filter by status
        $query->whereIn('status', [
            'Accept by MO',
            'Revision by CCH',
            'Accept by CCH'
        ]);
        
        // Apply search filter
        if ($searchQuery) {
            $query->where('judul', 'like', '%' . $searchQuery . '%');
        }
        
        // Apply status filter
        if ($statusFilter) {
            $query->where('status', $statusFilter);
        }
        
        // Filter by area
        if ($areaFilter && $areaFilter !== 'all') {
            $query->where('area_id', $areaFilter);
        }
        
        // Filter by category
        if ($categoryFilter && $categoryFilter !== 'all') {
            $query->where('category_id', $categoryFilter);
        }
        
        // Get documents with signature info
        $documents = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Transform documents to include signature info
        $documents->getCollection()->transform(function ($document) {
            $docArray = $document->toArray();
            $docArray['has_signature'] = !is_null($document->signature_page);
            $docArray['signature_info'] = [
                'page' => $document->signature_page,
                'x' => $document->signature_x,
                'y' => $document->signature_y,
                'width' => $document->signature_width,
                'height' => $document->signature_height,
            ];
            return $docArray;
        });
        
        // Get all areas and categories for filters
        $areas = Area::select('id', 'nama')->get();
        $categories = Category::select('id', 'nama')->get();
        
        $statuses = [
            'Accept by MO',
            'Revision by CCH',
            'Accept by CCH'
        ];
        
        return Inertia::render("CCH/Review/page", [
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
            'status' => 'required|in:Revision by CCH,Accept by CCH',
            'notes' => 'nullable|string',
        ]);
        
        $document = Document::findOrFail($id);
        $user = Auth::user();
        
        $document->status = $request->status;
        
        if ($request->filled('notes')) {
            $document->notes = $request->notes;
        }
        
        $document->save();
        
        if ($request->filled('notes')) {
            Feedback::create([
                'message' => $request->notes,
                'user_id' => $user->id,
                'document_id' => $document->id,
            ]);
        }
        
        return redirect()->back()->with('success', 'Document status updated successfully');
    }
    
    public function download($id)
    {
        $document = Document::findOrFail($id);
        
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'File not found');
        }
        
        $extension = pathinfo($document->file_name, PATHINFO_EXTENSION);
        
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
        
        if (!in_array($document->status, ['Accept by MO', 'Revision by CCH', 'Accept by CCH'])) {
            abort(403, 'Document is not available for preview');
        }
        
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found');
        }
        
        $extension = pathinfo($document->file_name, PATHINFO_EXTENSION);
        
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