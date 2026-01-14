<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Category;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AreaUploadController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get all areas and categories for dropdowns
        $areas = Area::select('id', 'nama')->get();
        $categories = Category::select('id', 'nama')->get();
        
        return Inertia::render("AMO Area/Upload/page", [
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
            'areas' => $areas,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'periode_mulai' => 'required|date',
            'periode_selesai' => 'required|date|after_or_equal:periode_mulai',
            'area_id' => 'required|exists:areas,id',
            'category_id' => 'required|exists:categories,id',
            'file' => 'required|file|mimes:doc,docx,pdf|max:10240', // 10MB max
            'status' => 'required|in:Draft,On Process',
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('documents', $fileName, 'public');

        $document = Document::create([
            'judul' => $request->judul,
            'periode_mulai' => $request->periode_mulai,
            'periode_selesai' => $request->periode_selesai,
            'status' => $request->status,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'file_type' => $file->getClientMimeType(),
            'area_id' => $request->area_id,
            'category_id' => $request->category_id,
            'user_id' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Document uploaded successfully!');
    }
}