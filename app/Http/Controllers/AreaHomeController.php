<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AreaHomeController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // filter parameters
        $statusFilter = $request->input('status');
        $categoryFilter = $request->input('category');
        
        // Build query for documents belonging to user's area
        $query = Document::with(['category', 'area', 'user'])
            ->where('user_id', $user->id);
        
        // Apply status filter if provided
        if ($statusFilter) {
            $query->where('status', $statusFilter);
        }
        
        // Apply category filter if provided
        if ($categoryFilter) {
            $query->where('category_id', $categoryFilter);
        }
        
        // Get documents ordered by latest
        $documents = $query->orderBy('created_at', 'desc')->get();
        
        // Get all categories for filter dropdown
        $categories = Category::select('id', 'nama')->get();
        
        // Get all unique statuses for filter dropdown
        $statuses = [
            'Draft',
            'On Process',
            'Revision by AMO Region',
            'Revision by MO',
            'Revision by CCH',
            'Accept by AMO Region',
            'Accept by MO',
            'Accept by CCH'
        ];
        
        return Inertia::render("AMO Area/Home/page", [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'role' => $user->role,
                    'area' => $user->area ? [
                        'id' => $user->area->id,
                        'nama' => $user->area->nama,
                    ] : null,
                ]
            ],
            'documents' => $documents,
            'categories' => $categories,
            'statuses' => $statuses,
            'filters' => [
                'status' => $statusFilter,
                'category' => $categoryFilter,
            ]
        ]);
    }

    public function download($id)
    {
        $document = Document::findOrFail($id);
        
        // Check if user owns this document
        if ($document->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access');
        }
        
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found');
        }
        
        return response()->download($filePath, $document->file_name);
    }
}