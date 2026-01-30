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
use Illuminate\Support\Facades\Log;

class MOReviewController extends Controller
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
        
        // Filter by user role and status
        $query->where(function ($q) {
            // Documents from AMO Area with specific statuses
            $q->whereHas('user', function ($userQuery) {
                $userQuery->where('role', 'AMO Area');
            })->whereIn('status', [
                'Accept by AMO Region',
                'Revision by MO',
                'Accept by MO'
            ]);
            
            // OR Documents from AMO Region with specific statuses (including On Process)
            $q->orWhereHas('user', function ($userQuery) {
                $userQuery->where('role', 'AMO Region');
            })->whereIn('status', [
                'On Process',
                'Revision by MO',
                'Accept by MO'
            ]);
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
        
        // Get all areas and categories for filters
        $areas = Area::select('id', 'nama')->get();
        $categories = Category::select('id', 'nama')->get();
        
        // Get all unique statuses for filter dropdown (MO specific statuses)
        $statuses = [
            'On Process',
            'Accept by AMO Region',
            'Revision by MO',
            'Accept by MO'
        ];
        
        return Inertia::render("MO/Review/page", [
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
        try {
            // Log incoming request data
            Log::info('Update status request', [
                'document_id' => $id,
                'status' => $request->input('status'),
                'notes' => $request->input('notes'),
                'all_data' => $request->all()
            ]);

            $validated = $request->validate([
                'status' => 'required|in:Revision by MO,Accept by MO',
                'notes' => 'nullable|string',
            ]);
            
            $document = Document::findOrFail($id);
            
            Log::info('Document found', [
                'current_status' => $document->status,
                'new_status' => $validated['status']
            ]);
            
            // Check if document can be reviewed by MO
            if (!in_array($document->status, [
                'On Process',
                'Accept by AMO Region', 
                'Revision by MO', 
                'Accept by MO'
            ])) {
                Log::warning('Document status not allowed for review', [
                    'current_status' => $document->status
                ]);
                return redirect()->back()->with('error', 'Document cannot be reviewed at this status');
            }
            
            $user = Auth::user();
            
            // Update document status
            $document->status = $validated['status'];
            
            // Update notes if provided (optional - notes field in documents table)
            if ($request->filled('notes')) {
                $document->notes = $validated['notes'];
            }
            
            $document->save();
            
            Log::info('Document updated successfully');
            
            // Create feedback record if notes provided
            if ($request->filled('notes') && !empty(trim($validated['notes']))) {
                $feedback = Feedback::create([
                    'message' => $validated['notes'],
                    'user_id' => $user->id,
                    'document_id' => $document->id,
                ]);
                Log::info('Feedback created', ['feedback_id' => $feedback->id]);
            }
            
            return redirect()->back()->with('success', 'Review dokumen berhasil disimpan');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            $errors = [];
            foreach ($e->errors() as $field => $messages) {
                $errors = array_merge($errors, $messages);
            }
            return redirect()->back()->with('error', 'Validasi gagal: ' . implode(', ', $errors));
        } catch (\Exception $e) {
            Log::error('Error updating document status', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Gagal menyimpan review: ' . $e->getMessage());
        }
    }
    
    public function download($id)
    {
        $document = Document::findOrFail($id);
        
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
        
        // MO can preview documents that are available for review
        if (!in_array($document->status, [
            'On Process',
            'Accept by AMO Region', 
            'Revision by MO', 
            'Accept by MO'
        ])) {
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