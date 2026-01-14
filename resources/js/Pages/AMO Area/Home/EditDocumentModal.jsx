import React, { useState, useRef, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { FiX, FiFile } from "react-icons/fi";

export default function EditDocumentModal({ isOpen, onClose, document, areas, categories }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        judul: document?.judul || "",
        periode_mulai: document?.periode_mulai || "",
        periode_selesai: document?.periode_selesai || "",
        area_id: document?.area_id || "",
        category_id: document?.category_id || "",
        file: null,
        notes: document?.notes || "",
        _method: "PUT",
    });

    useEffect(() => {
        if (document) {
            setData({
                judul: document.judul,
                periode_mulai: document.periode_mulai,
                periode_selesai: document.periode_selesai,
                area_id: document.area_id,
                category_id: document.category_id,
                file: null,
                notes: document.notes || "",
                _method: "PUT",
            });
            setUploadedFile(null);
        }
    }, [document]);

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            const maxSize = 10 * 1024 * 1024;

            if (!validTypes.includes(file.type)) {
                alert("Please upload a PDF, DOC, or DOCX file");
                return;
            }

            if (file.size > maxSize) {
                alert("File size must not exceed 10MB");
                return;
            }

            setUploadedFile(file);
            setData("file", file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route("amo-area.update-document", document.id), {
            forceFormData: true,
            onSuccess: () => {
                onClose();
                reset();
                setUploadedFile(null);
            },
        });
    };

    const handleClose = () => {
        reset();
        setUploadedFile(null);
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
                <div className="inline-block w-full max-w-5xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiFile className="text-yellow-400" />
                            EDIT DOCUMENT
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-yellow-400 transition-colors"
                        >
                            <FiX className="text-2xl" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Preview */}
                                <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center border-2 border-gray-200">
                                    <div className="text-center">
                                        <div className="w-32 h-32 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <FiFile className="text-white text-6xl" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-800 mb-2">
                                            DOKUMEN MEMO
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Current File: {document?.file_name}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column - Form */}
                                <div className="space-y-4">
                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            NOTES
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData("notes", e.target.value)}
                                            rows="5"
                                            placeholder="• Point 1&#10;• Point 2&#10;• Point 3"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                                        />
                                    </div>

                                    {/* Judul */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Judul
                                        </label>
                                        <input
                                            type="text"
                                            value={data.judul}
                                            onChange={(e) => setData("judul", e.target.value)}
                                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                        />
                                        {errors.judul && (
                                            <p className="text-red-500 text-sm mt-1">{errors.judul}</p>
                                        )}
                                    </div>

                                    {/* Periode */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Periode
                                        </label>
                                        <input
                                            type="text"
                                            value={`${data.periode_mulai} - ${data.periode_selesai}`}
                                            readOnly
                                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50"
                                        />
                                    </div>

                                    {/* Kategori & Area */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Kategori Merchant
                                            </label>
                                            <select
                                                value={data.category_id}
                                                onChange={(e) => setData("category_id", e.target.value)}
                                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
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
                                                Area
                                            </label>
                                            <select
                                                value={data.area_id}
                                                onChange={(e) => setData("area_id", e.target.value)}
                                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
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
                                            Upload Dokumen
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
                                                accept=".pdf,.doc,.docx"
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200"
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
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t-2 border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={processing}
                                className="px-8 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-2.5 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? "Updating..." : "Edit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}