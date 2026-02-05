import React, { useState, useRef } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import AreaLayout from "../../../Layouts/AreaLayout";
import { FiUploadCloud, FiFile, FiX, FiCheck } from "react-icons/fi";
import { toast, Toaster } from "sonner";

export default function Upload() {
    const { areas, categories, auth, flash } = usePage().props;
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        judul: "",
        periode_mulai: "",
        periode_selesai: "",
        area_id: auth.user.area?.id || "",
        category_id: "",
        file: null,
        status: "",
    });

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
            const validTypes = [
                "application/pdf",
            ];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!validTypes.includes(file.type)) {
                toast.error("Format File Tidak Valid", {
                    description:
                        "Hanya file PDF yang diperbolehkan.",
                    duration: 5000,
                });
                return;
            }

            if (file.size > maxSize) {
                toast.error("Ukuran File Terlalu Besar", {
                    description: "Maksimal ukuran file adalah 10MB.",
                    duration: 5000,
                });
                return;
            }

            setUploadedFile(file);
            setData("file", file);
            toast.success("File Berhasil Dipilih", {
                description: `${file.name} siap untuk diupload.`,
                duration: 3000,
            });
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const removeFile = () => {
        setUploadedFile(null);
        setData("file", null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.info("File Dihapus", {
            description: "File yang dipilih telah dihapus.",
            duration: 2000,
        });
    };

    const handleSubmit = (status) => {
        // Validation before submit
        if (
            !data.judul ||
            !data.periode_mulai ||
            !data.periode_selesai ||
            !data.area_id ||
            !data.category_id ||
            !data.file
        ) {
            toast.error("Form Tidak Lengkap", {
                description: "Mohon lengkapi semua field yang wajib diisi.",
                duration: 5000,
            });
            return;
        }

        // Buat FormData secara manual untuk memastikan status dikirim dengan benar
        const formData = new FormData();
        formData.append("judul", data.judul);
        formData.append("periode_mulai", data.periode_mulai);
        formData.append("periode_selesai", data.periode_selesai);
        formData.append("area_id", data.area_id);
        formData.append("category_id", data.category_id);
        formData.append("status", status); // Status langsung dari parameter
        formData.append("file", data.file);
        
        console.log("Submitting with status:", status);
        console.log("FormData entries:");
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
        
        // Gunakan router.post langsung dengan FormData
        router.post("/amo-area/upload-document", formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setUploadedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                toast.success("Upload Berhasil", {
                    description: `Dokumen berhasil ${
                        status === "Draft"
                            ? "disimpan sebagai draft"
                            : "diupload"
                    }.`,
                    duration: 4000,
                });
            },
            onError: (errors) => {
                console.error("Upload errors:", errors);
                console.error("Status yang dikirim:", status);
                const firstError = Object.values(errors)[0];
                toast.error("Upload Gagal", {
                    description:
                        firstError ||
                        "Terjadi kesalahan saat mengupload dokumen.",
                    duration: 5000,
                });
            },
        });
    };

    return (
        <AreaLayout>
            <Toaster
                position="top-right"
                expand={true}
                richColors
                closeButton
                toastOptions={{
                    style: {
                        padding: "16px",
                        borderRadius: "12px",
                        fontSize: "14px",
                    },
                    className: "sonner-toast",
                }}
            />

            <div className="min-h-full">
                {flash?.success && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md flex items-center animate-fade-in">
                        <FiCheck className="text-green-600 text-xl mr-3 flex-shrink-0" />
                        <p className="text-green-800 font-medium">
                            {flash.success}
                        </p>
                    </div>
                )}

                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl p-5 mb-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 opacity-10 rounded-full -ml-24 -mb-24"></div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-extrabold text-white mb-2 flex items-center">
                            <FiUploadCloud className="mr-4 text-yellow-400" />
                            Upload Your MEMO
                        </h1>
                        <p className="text-blue-100 text-md">
                            Fill in the details below to upload a MEMO document
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="space-y-6">
                        {/* Judul Field */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Judul <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.judul}
                                onChange={(e) =>
                                    setData("judul", e.target.value)
                                }
                                placeholder="Masukkan judul MEMO"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            />
                            {errors.judul && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.judul}
                                </p>
                            )}
                        </div>

                        {/* Periode and Area Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Periode{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="date"
                                        value={data.periode_mulai}
                                        onChange={(e) =>
                                            setData(
                                                "periode_mulai",
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                    />
                                    <span className="text-gray-500 font-medium">
                                        -
                                    </span>
                                    <input
                                        type="date"
                                        value={data.periode_selesai}
                                        min={data.periode_mulai || undefined}
                                        onChange={(e) =>
                                            setData(
                                                "periode_selesai",
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                    />
                                </div>
                                {(errors.periode_mulai ||
                                    errors.periode_selesai) && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.periode_mulai ||
                                            errors.periode_selesai}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Area <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.area_id}
                                    disabled
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                                >
                                    <option value={data.area_id}>
                                        {auth.user.area?.name || "Area Anda"}
                                    </option>
                                </select>
                                {errors.area_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.area_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Kategori Merchant */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Kategori Merchant{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) =>
                                    setData("category_id", e.target.value)
                                }
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                            >
                                <option value="">Select</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.nama}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.category_id}
                                </p>
                            )}
                        </div>

                        {/* Upload Dokumen */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Upload Dokumen{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            {!uploadedFile ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                                        isDragging
                                            ? "border-blue-900 bg-blue-50 scale-105"
                                            : "border-gray-300 bg-gray-50 hover:border-blue-700 hover:bg-blue-50"
                                    }`}
                                >
                                    <FiUploadCloud className="mx-auto text-6xl text-gray-400 mb-4" />
                                    <p className="text-gray-700 font-semibold text-lg mb-2">
                                        Select a file or drag and drop here
                                    </p>
                                    <p className="text-gray-500 text-sm mb-6">
                                        PDF only, size no more than 10MB
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileInputChange}
                                        accept=".pdf"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="px-8 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                                                    {uploadedFile.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {(
                                                        uploadedFile.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-all duration-200 group"
                                        >
                                            <FiX className="text-red-600 text-xl group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {errors.file && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.file}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-100">
                            <button
                                type="button"
                                onClick={() => handleSubmit("Draft")}
                                disabled={processing}
                                className="px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {processing ? "Saving..." : "Save as Draft"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit("On Process")}
                                disabled={processing}
                                className="px-8 py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white font-bold rounded-xl hover:from-blue-800 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                            >
                                <span className="relative z-10">
                                    {processing
                                        ? "Uploading..."
                                        : "Upload Document"}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AreaLayout>
    );
}