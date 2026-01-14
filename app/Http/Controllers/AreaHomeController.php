<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Category;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AreaHomeController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get filter parameters
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
        
        // Get all categories and areas for dropdowns
        $categories = Category::select('id', 'nama')->get();
        $areas = Area::select('id', 'nama')->get();
        
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
            'areas' => $areas,
            'statuses' => $statuses,
            'filters' => [
                'status' => $statusFilter,
                'category' => $categoryFilter,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $document = Document::findOrFail($id);
        
        // Check if user owns this document
        if ($document->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'judul' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'area_id' => 'required|exists:areas,id',
            'file' => 'nullable|file|mimes:doc,docx,pdf|max:10240',
            'notes' => 'nullable|string',
        ]);

        $updateData = [
            'judul' => $request->judul,
            'category_id' => $request->category_id,
            'area_id' => $request->area_id,
            'notes' => $request->notes,
        ];

        // Handle file upload if new file is provided
        if ($request->hasFile('file')) {
            // Delete old file
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('documents', $fileName, 'public');

            $updateData['file_name'] = $fileName;
            $updateData['file_path'] = $filePath;
            $updateData['file_size'] = $file->getSize();
            $updateData['file_type'] = $file->getClientMimeType();
        }

        $document->update($updateData);

        return redirect()->back()->with('success', 'Document updated successfully!');
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
}