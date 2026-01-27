import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import CCHLayout from "../../../Layouts/CCHLayout";
import { FiUploadCloud, FiFile, FiX, FiMaximize2, FiChevronLeft, FiChevronRight, FiCheck } from "react-icons/fi";
import { toast, Toaster } from "sonner";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export default function UploadSign() {
    const { auth, documents } = usePage().props;
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedSignature, setUploadedSignature] = useState(null);
    const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
    const [signatureSize, setSignatureSize] = useState({ width: 200, height: 100 });
    const [isDraggingSignature, setIsDraggingSignature] = useState(false);
    const [isResizingSignature, setIsResizingSignature] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 200, height: 100 });

    // PDF State
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfScale, setPdfScale] = useState(1.0);
    const [containerWidth, setContainerWidth] = useState(800);

    const fileInputRef = useRef(null);
    const documentPreviewRef = useRef(null);
    const signatureRef = useRef(null);
    const pdfWrapperRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        document_id: "",
        signature: null,
        x_position: 50,
        y_position: 50,
        width: 200,
        height: 100,
        page_number: 1,
    });

    // Update container width for responsive PDF scaling
    useEffect(() => {
        const updateWidth = () => {
            if (documentPreviewRef.current) {
                setContainerWidth(documentPreviewRef.current.clientWidth);
            }
        };

        window.addEventListener('resize', updateWidth);
        updateWidth();

        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const changePage = (offset) => {
        setPageNumber(prevPageNumber => {
            const newPage = prevPageNumber + offset;
            if (newPage >= 1 && newPage <= numPages) {
                return newPage;
            }
            return prevPageNumber;
        });
    };

    const handleDocumentChange = (e) => {
        const documentId = e.target.value;
        const document = documents.find((doc) => doc.id === parseInt(documentId));

        if (document) {
            setSelectedDocument(document);
            setData("document_id", documentId);
            const previewUrl = `/cch/preview-signature-document/${document.id}`;
            setPreviewUrl(previewUrl);
            setPageNumber(1);
        } else {
            setSelectedDocument(null);
            setPreviewUrl(null);
            setData("document_id", "");
            setPageNumber(1);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleFileSelect = (file) => {
        if (file) {
            const maxSize = 10 * 1024 * 1024;
            const fileName = file.name.toLowerCase();
            const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
            const validTypes = ["image/png", "image/x-png"];
            const isValidExtension = extension === 'png';
            const isValidMimeType = !file.type || validTypes.includes(file.type);

            if (!isValidExtension) {
                toast.error("Format File Tidak Valid", {
                    description: "Hanya file PNG yang diperbolehkan (ekstensi .png).",
                    duration: 5000,
                });
                return;
            }

            if (!isValidMimeType && file.type) {
                console.warn('File has .png extension but unexpected MIME type:', file.type);
            }

            if (file.size > maxSize) {
                toast.error("Ukuran File Terlalu Besar", {
                    description: "Maksimal ukuran file adalah 10MB.",
                    duration: 5000,
                });
                return;
            }

            setUploadedSignature(file);
            setData("signature", file);
            setSignaturePosition({ x: 50, y: 50 });
            setSignatureSize({ width: 200, height: 100 });
            setData("page_number", pageNumber); // Set to current viewing page

            toast.success("Signature Berhasil Dipilih", {
                description: `${file.name} akan ditempatkan pada halaman ${pageNumber}.`,
                duration: 3000,
            });
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const removeSignature = () => {
        setUploadedSignature(null);
        setData("signature", null);
        setSignaturePosition({ x: 50, y: 50 });
        setSignatureSize({ width: 200, height: 100 });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.info("Signature Dihapus", {
            description: "Signature yang dipilih telah dihapus.",
            duration: 2000,
        });
    };

    // Update data page_number when page changes
    useEffect(() => {
        if (uploadedSignature) {
            setData("page_number", pageNumber);
        }
    }, [pageNumber, uploadedSignature, setData]);

    const handleSignatureMouseDown = (e) => {
        if (!uploadedSignature) return;

        e.preventDefault();
        e.stopPropagation();
        setIsDraggingSignature(true);

        // Get coordinates relative to the PDF Page container (not the window)
        // We use the parent element of the signature (which should be the same size as the PDF page)
        const container = e.currentTarget.parentElement.parentElement;
        const rect = container.getBoundingClientRect();

        const x = e.clientX - rect.left - signaturePosition.x;
        const y = e.clientY - rect.top - signaturePosition.y;
        setDragOffset({ x, y });
    };

    const handleResizeMouseDown = (e) => {
        if (!uploadedSignature) return;

        e.preventDefault();
        e.stopPropagation();
        setIsResizingSignature(true);

        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: signatureSize.width,
            height: signatureSize.height,
            startX: signaturePosition.x,
            startY: signaturePosition.y,
        });
    };

    useEffect(() => {
        let animationFrameId = null;

        const handleMouseMove = (e) => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            animationFrameId = requestAnimationFrame(() => {
                if (isResizingSignature && pdfWrapperRef.current) {
                    const rect = pdfWrapperRef.current.getBoundingClientRect();
                    const deltaX = e.clientX - resizeStart.x;
                    const aspectRatio = resizeStart.width / resizeStart.height;

                    const maxWidth = Math.min(500, rect.width - resizeStart.startX);
                    const minWidth = 20;
                    let newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
                    let newHeight = newWidth / aspectRatio;

                    const maxHeight = rect.height - resizeStart.startY;
                    if (newHeight > maxHeight) {
                        newHeight = maxHeight;
                        newWidth = newHeight * aspectRatio;
                    }

                    setSignatureSize({
                        width: newWidth,
                        height: newHeight,
                    });
                } else if (isDraggingSignature && pdfWrapperRef.current) {
                    const rect = pdfWrapperRef.current.getBoundingClientRect();

                    let x = e.clientX - rect.left - dragOffset.x;
                    let y = e.clientY - rect.top - dragOffset.y;

                    const maxX = rect.width - signatureSize.width;
                    const maxY = rect.height - signatureSize.height;

                    x = Math.max(0, Math.min(maxX, x));
                    y = Math.max(0, Math.min(maxY, y));

                    setSignaturePosition({ x, y });
                }
            });
        };

        const handleMouseUp = () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            if (isDraggingSignature) {
                setIsDraggingSignature(false);
                setData("x_position", signaturePosition.x);
                setData("y_position", signaturePosition.y);
            }
            if (isResizingSignature) {
                setIsResizingSignature(false);
                setData("width", signatureSize.width);
                setData("height", signatureSize.height);
            }
        };

        if (isDraggingSignature || isResizingSignature) {
            document.addEventListener("mousemove", handleMouseMove, { passive: true });
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = isDraggingSignature ? 'grabbing' : 'se-resize';
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isDraggingSignature, isResizingSignature, dragOffset, signaturePosition, signatureSize, resizeStart, setData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedDocument) {
            toast.error("Pilih Dokumen", {
                description: "Mohon pilih dokumen terlebih dahulu.",
                duration: 5000,
            });
            return;
        }

        if (!uploadedSignature) {
            toast.error("Upload Signature", {
                description: "Mohon upload signature terlebih dahulu.",
                duration: 5000,
            });
            return;
        }

        const previewElement = pdfWrapperRef.current;
        let previewWidth = 800;
        let previewHeight = 600;

        if (previewElement) {
            previewWidth = previewElement.clientWidth;
            previewHeight = previewElement.clientHeight;
        }

        const formData = new FormData();
        formData.append("document_id", data.document_id);
        formData.append("signature", data.signature);
        formData.append("x_position", signaturePosition.x);
        formData.append("y_position", signaturePosition.y);
        formData.append("width", signatureSize.width);
        formData.append("height", signatureSize.height);
        formData.append("page_number", pageNumber); // Explicitly use current page number
        formData.append("preview_width", previewWidth);
        formData.append("preview_height", previewHeight);

        router.post("/cch/upload-signature", formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedDocument(null);
                setPreviewUrl(null);
                setUploadedSignature(null);
                setSignaturePosition({ x: 50, y: 50 });
                setSignatureSize({ width: 200, height: 100 });
                setPageNumber(1);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                toast.success("Signature Berhasil Disimpan", {
                    description: `Signature telah ditambahkan.`,
                    duration: 4000,
                });
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error("Gagal Menyimpan", {
                    description: firstError || "Terjadi kesalahan saat menyimpan signature.",
                    duration: 5000,
                });
            },
        });
    };

    const handleCancel = () => {
        router.visit("/cch/review");
    };

    return (
        <CCHLayout>
            <Toaster
                position="top-right"
                expand={true}
                richColors
                closeButton
            />

            <div className="min-h-full">
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl p-5 mb-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 opacity-10 rounded-full -ml-24 -mb-24"></div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-extrabold text-white mb-2">
                            Finalize Approval
                        </h1>
                        <p className="text-blue-100 text-md">
                            Add your signature to complete the MEMO document approval.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Dokumen <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.document_id}
                                    onChange={handleDocumentChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                                >
                                    <option value="">Select Document</option>
                                    {documents.map((document) => (
                                        <option key={document.id} value={document.id}>
                                            {document.judul}
                                        </option>
                                    ))}
                                </select>
                                {errors.document_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.document_id}
                                    </p>
                                )}
                            </div>

                            {previewUrl && (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => changePage(-1)}
                                                disabled={pageNumber <= 1}
                                                className="p-2 rounded-full hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                            >
                                                <FiChevronLeft />
                                            </button>

                                            <span className="text-sm font-semibold text-gray-700">
                                                Page {pageNumber} of {numPages || '--'}
                                            </span>

                                            <button
                                                onClick={() => changePage(1)}
                                                disabled={pageNumber >= numPages}
                                                className="p-2 rounded-full hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                            >
                                                <FiChevronRight />
                                            </button>
                                        </div>

                                        {uploadedSignature && (
                                            <div className="flex items-center gap-2">
                                                <FiCheck className="text-green-500" />
                                                <span className="text-xs text-gray-600">
                                                    Signature active on this page
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div
                                ref={documentPreviewRef}
                                className="border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center min-h-[600px] relative overflow-hidden"
                            >
                                {previewUrl ? (
                                    <Document
                                        file={previewUrl}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        className="max-w-full"
                                        loading={
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900"></div>
                                                Loading PDF...
                                            </div>
                                        }
                                    >
                                        <div className="relative inline-block" ref={pdfWrapperRef}>
                                            <Page
                                                pageNumber={pageNumber}
                                                width={containerWidth - 40} // Subtract padding
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                                className="shadow-lg"
                                            />

                                            {uploadedSignature && (
                                                <div
                                                    className="absolute border-2 border-blue-500 rounded-lg shadow-lg bg-white/20 p-1 transition-transform hover:bg-white/40"
                                                    style={{
                                                        left: `${signaturePosition.x}px`,
                                                        top: `${signaturePosition.y}px`,
                                                        width: `${signatureSize.width}px`,
                                                        height: `${signatureSize.height}px`,
                                                        zIndex: 10,
                                                        pointerEvents: "auto",
                                                        cursor: isDraggingSignature ? 'grabbing' : 'grab',
                                                    }}
                                                >
                                                    <img
                                                        ref={signatureRef}
                                                        src={URL.createObjectURL(uploadedSignature)}
                                                        alt="Signature"
                                                        className="w-full h-full object-contain select-none"
                                                        onMouseDown={handleSignatureMouseDown}
                                                        draggable={false}
                                                        style={{
                                                            pointerEvents: isResizingSignature ? 'none' : 'auto',
                                                        }}
                                                    />
                                                    <div
                                                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize rounded-tl-lg flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all shadow-md"
                                                        onMouseDown={handleResizeMouseDown}
                                                        title="Resize signature"
                                                    >
                                                        <FiMaximize2 className="text-white text-xs transform rotate-45" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Document>
                                ) : (
                                    <div className="text-center text-gray-500 p-10">
                                        <FiFile className="text-6xl mb-4 text-gray-400 mx-auto" />
                                        <p className="text-lg font-semibold text-gray-700">
                                            DOKUMEN MEMO
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Pilih dokumen untuk melihat preview
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Upload Signature{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                {!uploadedSignature ? (
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragging
                                                ? "border-blue-900 bg-blue-50 scale-105"
                                                : "border-gray-300 bg-gray-50 hover:border-blue-700 hover:bg-blue-50"
                                            }`}
                                    >
                                        <FiUploadCloud className="mx-auto text-6xl text-gray-400 mb-4" />
                                        <p className="text-gray-700 font-semibold text-lg mb-2">
                                            Select a file or drag and drop here
                                        </p>
                                        <p className="text-gray-500 text-sm mb-6">
                                            PNG only, size no more than 10MB
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileInputChange}
                                            accept=".png,image/png"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-700 hover:text-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            Select File
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-blue-200 bg-blue-50 rounded-2xl p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                                                    <FiFile className="text-white text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">
                                                        {uploadedSignature.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {(uploadedSignature.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeSignature}
                                                className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-all duration-200 group"
                                            >
                                                <FiX className="text-red-600 text-xl group-hover:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {errors.signature && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.signature}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t-2 border-gray-100">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={processing}
                            className="px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing || !selectedDocument || !uploadedSignature}
                            className="px-8 py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white font-bold rounded-xl hover:from-blue-800 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                        >
                            <span className="relative z-10">
                                {processing ? "Saving..." : "Save"}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>
            </div>
        </CCHLayout>
    );
}