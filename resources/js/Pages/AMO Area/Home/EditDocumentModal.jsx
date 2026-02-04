import React, { useState, useRef, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { FiX, FiFile } from "react-icons/fi";
import { toast } from "sonner";

export default function EditDocumentModal({ isOpen, onClose, document, areas, categories, canEdit = true }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const getPreviewUrl = (doc, cacheBuster = null) => {
        if (!doc || !doc.id) return null;
        // Gunakan endpoint preview yang sudah ada
        let url = `/amo-area/preview-document/${doc.id}`;
        // Tambahkan cache buster jika ada file baru
        if (cacheBuster) {
            url += `?t=${cacheBuster}`;
        }
        return url;
    };

    // Pastikan tanggal selalu dalam format yyyy-mm-dd untuk input date
    const formatDateForInput = (value) => {
        if (!value) return "";
        // Jika string mengandung waktu, ambil 10 karakter pertama (yyyy-mm-dd)
        if (typeof value === "string" && value.length >= 10) {
            return value.slice(0, 10);
        }
        return value;
    };

    const { data, setData, processing, errors, reset } = useForm({
        judul: document?.judul || "",
        periode_mulai: formatDateForInput(document?.periode_mulai),
        periode_selesai: formatDateForInput(document?.periode_selesai),
        area_id: document?.area_id || "",
        category_id: document?.category_id || "",
        file: null,
        notes: document?.notes || "",
        status: "",
    });

    useEffect(() => {
        if (document) {
            setData({
                judul: document.judul,
                periode_mulai: formatDateForInput(document.periode_mulai),
                periode_selesai: formatDateForInput(document.periode_selesai),
                area_id: document.area_id,
                category_id: document.category_id,
                file: null,
                notes: document.notes || "",
                status: "",
            });
            setUploadedFile(null);
            // gunakan endpoint preview untuk file existing dengan cache buster untuk memastikan file terbaru
            const timestamp = Date.now();
            setPreviewUrl(getPreviewUrl(document, timestamp));
        }
    }, [document, setData]);

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = [
                "application/pdf",
            ];
            const maxSize = 10 * 1024 * 1024;

            if (!validTypes.includes(file.type)) {
                toast.error("Format File Tidak Valid", {
                    description: "Hanya file PDF yang diperbolehkan.",
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

            // Cleanup blob URL sebelumnya jika ada
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }

            setUploadedFile(file);
            setData("file", file);
            // buat preview dari file lokal
            const tempUrl = URL.createObjectURL(file);
            setPreviewUrl(tempUrl);
            toast.success("File Berhasil Dipilih", {
                description: `${file.name} berhasil dipilih.`,
                duration: 3000,
            });
        }
    };

    // cleanup object URL ketika komponen unmount
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleSubmit = (status) => {
        // Validasi frontend sebelum submit
        const validationErrors = [];

        if (!data.judul || data.judul.trim() === "") {
            validationErrors.push("Judul harus diisi");
        }

        if (!data.periode_mulai) {
            validationErrors.push("Periode mulai harus diisi");
        }

        if (!data.periode_selesai) {
            validationErrors.push("Periode selesai harus diisi");
        }

        if (!data.area_id) {
            validationErrors.push("Area harus dipilih");
        }

        if (!data.category_id) {
            validationErrors.push("Kategori merchant harus dipilih");
        }

        // Jika ada error validasi, tampilkan error dan jangan submit
        if (validationErrors.length > 0) {
            toast.error("Form Tidak Lengkap", {
                description: validationErrors.join(", "),
                duration: 5000,
            });
            return; // Jangan submit, modal tetap terbuka
        }

        // Validasi tanggal: periode selesai harus setelah atau sama dengan periode mulai
        if (new Date(data.periode_selesai) < new Date(data.periode_mulai)) {
            toast.error("Periode Tidak Valid", {
                description: "Periode selesai harus setelah atau sama dengan periode mulai",
                duration: 5000,
            });
            return; // Jangan submit, modal tetap terbuka
        }

        // Gunakan FormData manual dan kirim sebagai POST tanpa override ke PUT
        const formData = new FormData();
        formData.append("judul", data.judul);
        formData.append("periode_mulai", data.periode_mulai);
        formData.append("periode_selesai", data.periode_selesai);
        formData.append("area_id", data.area_id);
        formData.append("category_id", data.category_id);
        formData.append("notes", data.notes || "");
        formData.append("status", status);

        if (data.file) {
            formData.append("file", data.file);
        }

        router.post(`/amo-area/update-document/${document.id}`, formData, {
            preserveScroll: true,
            preserveState: false,
            forceFormData: true,
            only: ['documents', 'filters', 'flash'],
            onSuccess: () => {
                toast.success("Update Berhasil", {
                    description: `Dokumen berhasil ${status === "Draft"
                        ? "disimpan sebagai draft"
                        : "diupdate"
                        }.`,
                    duration: 4000,
                });
                onClose();
                reset();
                setUploadedFile(null);
            },
            onError: (errors) => {
                console.error("Update errors:", errors);
                const firstError = Object.values(errors)[0];
                toast.error("Update Gagal", {
                    description:
                        firstError ||
                        "Terjadi kesalahan saat mengupdate dokumen.",
                    duration: 5000,
                });
                // Modal tetap terbuka jika ada error dari backend
            },
        });
    };

    const handleClose = () => {
        // Cleanup blob URL jika ada
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }
        reset();
        setUploadedFile(null);
        setPreviewUrl(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
                    onClick={handleClose}
                ></div>

                {/* Modal */}
                <div className="inline-block w-full max-w-5xl my-2 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiFile className="text-yellow-400" />
                            {canEdit ? "EDIT DOCUMENT" : "VIEW DOCUMENT"}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-yellow-400 transition-colors"
                        >
                            <FiX className="text-2xl" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left Column - Preview */}
                                <div className="bg-gray-50 rounded-xl p-2.5 border-2 border-gray-200 flex flex-col">
                                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <FiFile className="text-blue-900" /> Preview Dokumen
                                    </h4>
                                    {previewUrl ? (
                                        <div className="w-full flex-1 min-h-[320px] border rounded-lg overflow-hidden bg-white">
                                            <iframe
                                                title="Document Preview"
                                                src={previewUrl}
                                                className="w-full h-full"
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <div className="w-full flex-1 min-h-[320px] flex flex-col items-center justify-center text-center text-gray-500 bg-white rounded-lg border border-dashed">
                                            <FiFile className="text-4xl mb-2" />
                                            <p className="text-sm">Belum ada dokumen untuk dipreview</p>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        Current File: {uploadedFile?.name || document?.file_name || "-"}
                                    </p>
                                </div>

                                {/* Right Column - Form */}
                                <div className="space-y-2.5">
                                    {/* Notes (read-only) */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            NOTES
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            readOnly
                                            rows="4"
                                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700 resize-none"
                                        />
                                    </div>

                                    {/* Judul */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Judul <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.judul}
                                            onChange={(e) => setData("judul", e.target.value)}
                                            readOnly={!canEdit}
                                            className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 ${!canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                                                }`}
                                        />
                                        {errors.judul && (
                                            <p className="text-red-500 text-sm mt-1">{errors.judul}</p>
                                        )}
                                    </div>

                                    {/* Periode (tanggal mulai & selesai) */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Periode <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            <input
                                                type="date"
                                                value={data.periode_mulai}
                                                onChange={(e) =>
                                                    setData("periode_mulai", e.target.value)
                                                }
                                                readOnly={!canEdit}
                                                className={`w-full sm:flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 ${!canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                                                    }`}
                                            />
                                            <span className="text-gray-500 font-medium hidden sm:block">
                                                -
                                            </span>
                                            <span className="text-gray-500 font-medium sm:hidden">
                                                s/d
                                            </span>
                                            <input
                                                type="date"
                                                value={data.periode_selesai}
                                                min={data.periode_mulai || undefined}
                                                onChange={(e) =>
                                                    setData("periode_selesai", e.target.value)
                                                }
                                                readOnly={!canEdit}
                                                className={`w-full sm:flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 ${!canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Kategori & Area */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Kategori Merchant <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={data.category_id}
                                                onChange={(e) => setData("category_id", e.target.value)}
                                                disabled={!canEdit}
                                                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 ${!canEdit ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                                                    }`}
                                            >
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Area <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={data.area_id}
                                                disabled
                                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                                            >
                                                {areas.map((area) => (
                                                    <option key={area.id} value={area.id}>
                                                        {area.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Upload Dokumen */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Upload Dokumen <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={uploadedFile?.name || document?.file_name}
                                                readOnly
                                                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50"
                                            />
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileInputChange}
                                                accept=".pdf"
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={!canEdit}
                                                className={`px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 ${!canEdit ? "opacity-50 cursor-not-allowed" : ""
                                                    }`}
                                            >
                                                Choose File
                                            </button>
                                        </div>
                                        {errors.file && (
                                            <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        {canEdit && (
                            <div className="bg-gray-50 px-5 py-3 flex justify-end gap-3 border-t-2 border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => handleSubmit("Draft")}
                                    disabled={processing}
                                    className="px-8 py-2.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {processing ? "Saving..." : "Save as Draft"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSubmit("On Process")}
                                    disabled={processing}
                                    className="px-8 py-2.5 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white font-bold rounded-xl hover:from-blue-800 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                                >
                                    <span className="relative z-10">
                                        {processing ? "Updating..." : "Save & Submit"}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}