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
        $query->where(function ($q) {
            $q->whereHas('user', function ($userQuery) {
                $userQuery->whereIn('role', ['AMO Area', 'AMO Region']);
            });
        })->where('status', '!=', 'Draft');
        
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
        
        // Get all areas and categories for filters
        $areas = Area::select('id', 'nama')->get();
        $categories = Category::select('id', 'nama')->get();
        
        $statuses = [
            'On Process',
            'Accept by AMO Region',
            'Revision by AMO Region',
            'Accept by MO',
            'Revision by MO',
            'Accept by CCH',
            'Revision by CCH'
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
        $validated = $request->validate([
            'status' => 'required|in:Accept by CCH,Revision by CCH',
            'notes' => 'nullable|string',
        ]);
        
        $document = Document::findOrFail($id);

        // Hanya izinkan CCH mengubah status dokumen jika status SAAT INI
        // adalah salah satu dari:
        // - On Process
        // - Accept by AMO Region
        // - Accept by MO
        if (!in_array($document->status, ['On Process', 'Accept by AMO Region', 'Accept by MO'])) {
            return redirect()->back()->with('error', 'Dokumen tidak dapat direview pada status saat ini.');
        }
      
        $user = Auth::user();

        $document->status = $validated['status'];
        
        if ($request->filled('notes')) {
            $document->notes = $validated['notes'];
        }

        $document->save();

        if ($request->filled('notes') && !empty(trim($validated['notes']))) {
                $feedback = Feedback::create([
                    'message' => $validated['notes'],
                    'user_id' => $user->id,
                    'document_id' => $document->id,
                ]);
            }
        
        return redirect()->back()->with('success', 'Review dokumen berhasil disimpan');
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