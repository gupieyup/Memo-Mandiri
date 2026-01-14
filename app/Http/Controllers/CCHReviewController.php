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
        
        // Build query
        $query = Document::with(['area', 'category', 'user', 'feedbacks.user']);
        
        // Filter by area if provided
        if ($request->filled('area_id') && $request->area_id !== 'all') {
            $query->where('area_id', $request->area_id);
        }
        
        // Filter by category if provided
        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }
        
        // Filter by status - CCH only sees documents that are "Accept by MO" or higher
        $query->whereIn('status', [
            'Accept by MO',
            'Revision by CCH',
            'Accept by CCH'
        ]);
        
        $documents = $query->orderBy('created_at', 'desc')->get();
        
        // Get all areas and categories for filters
        $areas = Area::all();
        $categories = Category::all();
        
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
            'filters' => [
                'area_id' => $request->area_id,
                'category_id' => $request->category_id,
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
        
        return redirect()->back()->with('success', 'Document status updated successfully');
    }
    
    public function download($id)
    {
        $document = Document::findOrFail($id);
        
        // Check if file exists
        if (!Storage::exists($document->file_path)) {
            return redirect()->back()->with('error', 'File not found');
        }
        
        return Storage::download($document->file_path, $document->file_name);
    }
}