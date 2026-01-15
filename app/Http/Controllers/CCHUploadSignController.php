<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use setasign\Fpdi\Fpdi;

class CCHUploadSignController extends Controller
{
    public function index(){
        $user = Auth::user();
        
        // Get documents with status "Accept by CCH"
        $documents = Document::with(['category', 'area', 'user'])
            ->where('status', 'Accept by CCH')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($document) {
                return [
                    'id' => $document->id,
                    'judul' => $document->judul,
                    'file_name' => $document->file_name,
                    'file_path' => $document->file_path,
                    'category' => $document->category ? $document->category->nama : null,
                    'area' => $document->area ? $document->area->nama : null,
                ];
            });
        
        return Inertia::render("CCH/Upload Sign/page", [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'role' => $user->role,
                    'area' => $user->area ? [
                        'id' => $user->area->id,
                        'name' => $user->area->name,
                    ] : null,
                ]
            ],
            'documents' => $documents,
        ]);
    }

    public function preview($id)
    {
        $document = Document::findOrFail($id);
        
        if ($document->status !== 'Accept by CCH') {
            abort(403, 'Document is not available for signature');
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

    public function store(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'document_id' => 'required|exists:documents,id',
                'signature' => 'required|file|mimes:png|max:10240', // max 10MB
                'x_position' => 'required|numeric|min:0',
                'y_position' => 'required|numeric|min:0',
                'width' => 'required|numeric|min:20|max:500',
                'height' => 'required|numeric|min:20|max:500',
            ]);

            // Get document
            $document = Document::findOrFail($validated['document_id']);
            
            if ($document->status !== 'Accept by CCH') {
                return back()->withErrors(['document_id' => 'Document is not available for signature']);
            }

            // Get original file path
            $originalPath = storage_path('app/public/' . $document->file_path);
            
            if (!file_exists($originalPath)) {
                return back()->withErrors(['document_id' => 'Original document not found']);
            }

            // Get file extension
            $extension = pathinfo($document->file_name, PATHINFO_EXTENSION);

            if ($extension === 'pdf') {
                // Process PDF
                $signedPath = $this->addSignatureToPdf(
                    $originalPath,
                    $request->file('signature'),
                    $validated['x_position'],
                    $validated['y_position'],
                    $validated['width'],
                    $validated['height']
                );
            } else {
                return back()->withErrors(['document_id' => 'Only PDF files are supported for signature']);
            }

            // Replace original file with signed version
            if ($signedPath && file_exists($signedPath)) {
                // Backup original (optional)
                $backupPath = storage_path('app/backups/' . $document->file_path);
                $backupDir = dirname($backupPath);
                if (!is_dir($backupDir)) {
                    mkdir($backupDir, 0755, true);
                }
                copy($originalPath, $backupPath);

                // Replace with signed version
                copy($signedPath, $originalPath);
                
                // Clean up temp file
                unlink($signedPath);

                // Update document status
                $document->update([
                    'status' => 'Signed by CCH',
                    'signed_at' => now(),
                    'signed_by' => Auth::id(),
                ]);

                return redirect()->route('cch.review')->with('success', 'Signature berhasil ditambahkan ke dokumen');
            }

            return back()->withErrors(['signature' => 'Failed to add signature to document']);

        } catch (\Exception $e) {
            Log::error('Error adding signature: ' . $e->getMessage());
            return back()->withErrors(['signature' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    private function addSignatureToPdf($pdfPath, $signatureFile, $x, $y, $width, $height)
    {
        try {
            // Create temp file for signed PDF
            $tempPath = storage_path('app/temp/signed_' . uniqid() . '.pdf');
            $tempDir = dirname($tempPath);
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Initialize FPDI
            $pdf = new Fpdi();
            
            // Get page count
            $pageCount = $pdf->setSourceFile($pdfPath);
            
            // Process each page
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                // Import page
                $templateId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($templateId);
                
                // Add page with same orientation
                $orientation = $size['width'] > $size['height'] ? 'L' : 'P';
                $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                
                // Use imported page as template
                $pdf->useTemplate($templateId);
                
                // Add signature only on first page
                if ($pageNo === 1) {
                    // Convert signature position from pixels to PDF units (points)
                    // Assuming 96 DPI for screen, PDF uses 72 DPI
                    $pdfX = ($x * 72) / 96;
                    $pdfY = ($y * 72) / 96;
                    $pdfWidth = ($width * 72) / 96;
                    $pdfHeight = ($height * 72) / 96;
                    
                    // Add signature image
                    $pdf->Image(
                        $signatureFile->getRealPath(),
                        $pdfX,
                        $pdfY,
                        $pdfWidth,
                        $pdfHeight,
                        'PNG'
                    );
                }
            }
            
            // Save signed PDF
            $pdf->Output('F', $tempPath);
            
            return $tempPath;

        } catch (\Exception $e) {
            Log::error('Error in addSignatureToPdf: ' . $e->getMessage());
            throw $e;
        }
    }
}