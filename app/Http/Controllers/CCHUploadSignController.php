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
        // First, validate basic requirements
        $request->validate([
            'document_id' => 'required|exists:documents,id',
            'signature' => [
                'required',
                'file',
                'max:10240', // 10MB max
            ],
            'x_position' => 'required|numeric|min:0',
            'y_position' => 'required|numeric|min:0',
            'width' => 'required|numeric|min:20|max:500',
            'height' => 'required|numeric|min:20|max:500',
            'preview_width' => 'nullable|numeric|min:100',
            'preview_height' => 'nullable|numeric|min:100',
        ]);

        // Additional validation: check if file is actually a PNG image
        $signatureFile = $request->file('signature');
        if (!$signatureFile) {
            return redirect()->back()->withErrors([
                'signature' => 'The signature field is required.'
            ])->withInput();
        }

        $extension = strtolower($signatureFile->getClientOriginalExtension());
        $mimeType = $signatureFile->getMimeType();
        
        // Check extension first (more reliable)
        if ($extension !== 'png') {
            return redirect()->back()->withErrors([
                'signature' => 'The signature field must be a PNG image file (.png extension required).'
            ])->withInput();
        }
        
        // Also check MIME type if available (secondary validation)
        $validMimeTypes = ['image/png', 'image/x-png', 'application/octet-stream'];
        if (!in_array($mimeType, $validMimeTypes) && $mimeType !== null) {
            // If MIME type is detected but not valid, still allow if extension is correct
            // Some systems may not detect MIME type correctly for PNG files
            // But we log it for debugging
            Log::warning('PNG file with unexpected MIME type', [
                'mime_type' => $mimeType,
                'extension' => $extension,
                'filename' => $signatureFile->getClientOriginalName()
            ]);
        }

        $document = Document::findOrFail($request->document_id);
        
        // Check if document status is "Accept by CCH"
        if ($document->status !== 'Accept by CCH') {
            return redirect()->back()->with('error', 'Only documents with status "Accept by CCH" can be signed');
        }

        $user = Auth::user();
        
        try {
            // Get original PDF path
            $originalPdfPath = storage_path('app/public/' . $document->file_path);
            
            if (!file_exists($originalPdfPath)) {
                return redirect()->back()->with('error', 'Original document file not found');
            }

            // Check if file is PDF
            $extension = pathinfo($document->file_name, PATHINFO_EXTENSION);
            if (strtolower($extension) !== 'pdf') {
                return redirect()->back()->with('error', 'Only PDF documents can be signed');
            }

            // Store signature image temporarily
            $signaturePath = $request->file('signature')->store('signatures', 'public');
            $signatureFullPath = storage_path('app/public/' . $signaturePath);

            // Create new PDF with signature using FPDI
            $pdf = new Fpdi();
            
            // Set source file
            $pageCount = $pdf->setSourceFile($originalPdfPath);
            
            // Get dimensions from last page for signature positioning
            $lastPageTplId = $pdf->importPage($pageCount);
            $lastPageSize = $pdf->getTemplateSize($lastPageTplId);
            $pdfWidth = $lastPageSize['width'];
            $pdfHeight = $lastPageSize['height'];
            
            // Get preview container dimensions (from frontend)
            $previewWidth = $request->input('preview_width', 800);
            $previewHeight = $request->input('preview_height', 600);
            
            // Convert pixel position to PDF points (72 DPI)
            // X position: direct conversion
            $xPosition = ($request->x_position / $previewWidth) * $pdfWidth;
            
            // Y position: PDF Y starts from bottom, so we need to invert
            // Frontend Y is from top, PDF Y is from bottom
            $yFromTop = $request->y_position;
            $yFromBottom = $pdfHeight - (($yFromTop / $previewHeight) * $pdfHeight) - (($request->height / $previewHeight) * $pdfHeight);
            $yPosition = max(0, $yFromBottom); // Ensure not negative
            
            // Convert pixel size to PDF points
            $signatureWidth = ($request->width / $previewWidth) * $pdfWidth;
            $signatureHeight = ($request->height / $previewHeight) * $pdfHeight;
            
            // Ensure signature fits within PDF bounds
            if ($xPosition + $signatureWidth > $pdfWidth) {
                $signatureWidth = max(10, $pdfWidth - $xPosition);
            }
            if ($yPosition < 0) {
                $yPosition = 0;
                $signatureHeight = min($signatureHeight, $pdfHeight);
            }
            if ($yPosition + $signatureHeight > $pdfHeight) {
                $signatureHeight = max(10, $pdfHeight - $yPosition);
            }
            
            // Import all pages and add signature to last page
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                // Import page
                $tplId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($tplId);
                
                // Add page
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($tplId);
                
                // Add signature only on the last page
                if ($pageNo == $pageCount) {
                    // Add signature image to PDF using Fpdf Image method
                    // FPDI extends FpdfTpl which extends FPDF, so Image() is available
                    $pdf->Image($signatureFullPath, $xPosition, $yPosition, $signatureWidth, $signatureHeight);
                }
            }
            
            // Generate new filename
            $newFileName = 'signed_' . time() . '_' . $document->file_name;
            $newFilePath = 'documents/' . $newFileName;
            $newFullPath = storage_path('app/public/' . $newFilePath);
            
            // Ensure directory exists
            $directory = dirname($newFullPath);
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Save new PDF
            $pdf->Output('F', $newFullPath);
            
            // Delete old file if exists
            if (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }
            
            // Update document with new file
            $document->file_name = $newFileName;
            $document->file_path = $newFilePath;
            $document->save();
            
            // Delete temporary signature file
            Storage::disk('public')->delete($signaturePath);
            
            return redirect()->back()->with('success', 'Signature successfully added to document');
            
        } catch (\Exception $e) {
            Log::error('Error adding signature to PDF: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to add signature: ' . $e->getMessage());
        }
    }
}