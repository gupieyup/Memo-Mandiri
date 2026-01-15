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
        // Validate the request (tanpa memaksa status, supaya insert tidak gagal)
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'periode_mulai' => 'required|date',
            'periode_selesai' => 'required|date|after_or_equal:periode_mulai',
            'area_id' => 'required|exists:areas,id',
            'category_id' => 'required|exists:categories,id',
            'file' => 'required|file|mimes:pdf|max:10240', // 10MB max
        ], [
            'judul.required' => 'Judul harus diisi',
            'periode_mulai.required' => 'Periode mulai harus diisi',
            'periode_selesai.required' => 'Periode selesai harus diisi',
            'periode_selesai.after_or_equal' => 'Periode selesai harus setelah atau sama dengan periode mulai',
            'area_id.required' => 'Area harus dipilih',
            'category_id.required' => 'Kategori merchant harus dipilih',
            'file.required' => 'File dokumen harus diupload',
            'file.mimes' => 'File harus berformat PDF',
            'file.max' => 'Ukuran file maksimal 10MB',
        ]);


        try {
            // Tentukan status akhir berdasarkan input tombol
            // Debug: log status yang diterima dari berbagai sumber
            $requestedStatus = $request->input('status');
            $requestedStatusGet = $request->get('status');
            $requestedStatusPost = $request->post('status');
            $allInput = $request->all();
            
            // Gunakan input() terlebih dahulu, jika tidak ada coba get/post
            $statusValue = $requestedStatus ?? $requestedStatusGet ?? $requestedStatusPost ?? null;
            
            // Jika value tepat 'On Process' maka On Process, selain itu jadikan Draft
            $finalStatus = ($statusValue === 'On Process') ? 'On Process' : 'Draft';
            
            // Handle file upload
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('documents', $fileName, 'public');

            // Create document record
            $document = Document::create([
                'judul' => $validated['judul'],
                'periode_mulai' => $validated['periode_mulai'],
                'periode_selesai' => $validated['periode_selesai'],
                'status' => $finalStatus,
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'file_type' => $file->getClientMimeType(),
                'area_id' => $validated['area_id'],
                'category_id' => $validated['category_id'],
                'user_id' => Auth::id(),
            ]);

            // Return success response
            return redirect()->back()->with('success', 
                $finalStatus === 'Draft' 
                    ? 'Dokumen berhasil disimpan sebagai draft!' 
                    : 'Dokumen berhasil diupload!'
            );

        } catch (\Exception $e) {
            // If file was uploaded, delete it
            if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan dokumen: ' . $e->getMessage()])
                ->withInput();
        }
    }
}