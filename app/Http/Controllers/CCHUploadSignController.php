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
        
        // Get documents with status "Accept by CCH" and not yet signed by CCH
        $documents = Document::with(['category', 'area', 'user'])
            ->where('status', 'Accept by CCH')
            ->where('is_signed_cch', false)
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
        // Validate request
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
            'page_number' => 'required|integer|min:1',
            'preview_width' => 'nullable|numeric|min:100',
            'preview_height' => 'nullable|numeric|min:100',
        ]);

        // Validate PNG file
        $signatureFile = $request->file('signature');
        if (!$signatureFile) {
            return redirect()->back()->withErrors([
                'signature' => 'The signature field is required.'
            ])->withInput();
        }

        $extension = strtolower($signatureFile->getClientOriginalExtension());
        $mimeType = $signatureFile->getMimeType();
        
        if ($extension !== 'png') {
            return redirect()->back()->withErrors([
                'signature' => 'The signature field must be a PNG image file (.png extension required).'
            ])->withInput();
        }
        
        $validMimeTypes = ['image/png', 'image/x-png', 'application/octet-stream'];
        if (!in_array($mimeType, $validMimeTypes) && $mimeType !== null) {
            Log::warning('PNG file with unexpected MIME type', [
                'mime_type' => $mimeType,
                'extension' => $extension,
                'filename' => $signatureFile->getClientOriginalName()
            ]);
        }

        $document = Document::findOrFail($request->document_id);
        
        if ($document->status !== 'Accept by CCH') {
            return redirect()->back()->with('error', 'Only documents with status "Accept by CCH" can be signed');
        }

        $user = Auth::user();
        
        try {
            $originalPdfPath = storage_path('app/public/' . $document->file_path);
            
            if (!file_exists($originalPdfPath)) {
                return redirect()->back()->with('error', 'Original document file not found');
            }

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
            
            // Get the target page number from request
            $targetPage = min($request->page_number, $pageCount);
            
            // Get dimensions from target page for signature positioning
            $targetPageTplId = $pdf->importPage($targetPage);
            $targetPageSize = $pdf->getTemplateSize($targetPageTplId);
            $pdfWidth = $targetPageSize['width'];
            $pdfHeight = $targetPageSize['height'];
            
            // Get preview container dimensions
            $previewWidth = $request->input('preview_width', 800);
            $previewHeight = $request->input('preview_height', 600);
            
            // Calculate scale factors
            // The iframe shows PDF scaled to fit the container
            $scaleX = $pdfWidth / $previewWidth;
            $scaleY = $pdfHeight / $previewHeight;
            
            // Convert pixel position to PDF points
            // Use the actual scale from preview to PDF
            $xPosition = $request->x_position * $scaleX;
            $yPosition = $request->y_position * $scaleY;
            
            // Convert pixel size to PDF points
            $signatureWidth = $request->width * $scaleX;
            $signatureHeight = $request->height * $scaleY;
            
            // Ensure signature fits within PDF bounds
            if ($xPosition + $signatureWidth > $pdfWidth) {
                $signatureWidth = max(10, $pdfWidth - $xPosition);
            }
            if ($yPosition + $signatureHeight > $pdfHeight) {
                $signatureHeight = max(10, $pdfHeight - $yPosition);
            }
            if ($xPosition < 0) {
                $xPosition = 0;
            }
            if ($yPosition < 0) {
                $yPosition = 0;
            }
            
            Log::info('Signature positioning', [
                'page' => $targetPage,
                'preview_width' => $previewWidth,
                'preview_height' => $previewHeight,
                'pdf_width' => $pdfWidth,
                'pdf_height' => $pdfHeight,
                'scale_x' => $scaleX,
                'scale_y' => $scaleY,
                'x_position_px' => $request->x_position,
                'y_position_px' => $request->y_position,
                'x_position_pdf' => $xPosition,
                'y_position_pdf' => $yPosition,
                'width' => $signatureWidth,
                'height' => $signatureHeight,
            ]);
            
            // Import all pages and add signature to target page only
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $tplId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($tplId);
                
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($tplId);
                
                // Add signature only on the target page
                if ($pageNo == $targetPage) {
                    // PDF coordinates: (0,0) is top-left in FPDI
                    $pdf->Image(
                        $signatureFullPath, 
                        $xPosition, 
                        $yPosition, 
                        $signatureWidth, 
                        $signatureHeight,
                        'PNG'
                    );
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
            
            // Update document with new file and signature info
            // $document->file_name = $newFileName; // Keep original filename
            $document->file_path = $newFilePath;
            $document->signature_page = $targetPage;
            $document->signature_x = $request->x_position;
            $document->signature_y = $request->y_position;
            $document->signature_width = $request->width;
            $document->signature_height = $request->height;
            $document->is_signed_cch = true;
            $document->save();
            
            // Delete temporary signature file
            Storage::disk('public')->delete($signaturePath);
            
            return redirect()->back()->with('success', 'Signature successfully added to document');
            
        } catch (\Exception $e) {
            Log::error('Error adding signature to PDF: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect()->back()->with('error', 'Failed to add signature: ' . $e->getMessage());
        }
    }
}