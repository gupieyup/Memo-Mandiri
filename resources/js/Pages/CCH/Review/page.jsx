import React, { useState } from "react";
import { router } from "@inertiajs/react";
import CCHLayout from "../../../Layouts/CCHLayout";
import { FiFilter, FiDownload, FiEdit } from "react-icons/fi";

export default function Review({ auth, documents, areas, categories, filters }) {
    const [selectedArea, setSelectedArea] = useState(filters?.area_id || "all");
    const [selectedCategory, setSelectedCategory] = useState(filters?.category_id || "all");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [reviewNotes, setReviewNotes] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const applyFilter = () => {
        router.get(
            "/cch/review",
            {
                area_id: selectedArea,
                category_id: selectedCategory,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDownload = (documentId) => {
        window.location.href = `/cch/download-document/${documentId}`;
    };

    const openReviewModal = (document) => {
        setSelectedDocument(document);
        setReviewNotes(document.notes || "");
        setSelectedStatus(document.status);
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedDocument(null);
        setReviewNotes("");
        setSelectedStatus("");
    };

    const handleSaveReview = () => {
        if (!selectedDocument) return;

        router.post(
            `/cch/update-status/${selectedDocument.id}`,
            {
                status: selectedStatus,
                notes: reviewNotes,
            },
            {
                onSuccess: () => {
                    closeReviewModal();
                },
            }
        );
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Accept by MO":
                return "bg-yellow-100 text-yellow-800 border border-yellow-300";
            case "Revision by CCH":
                return "bg-red-100 text-red-800 border border-red-300";
            case "Accept by CCH":
                return "bg-green-100 text-green-800 border border-green-300";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-300";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <CCHLayout>
            <div className="h-full">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-white mb-2">
                                Review Time
                            </h1>
                            <p className="text-blue-200 text-lg">
                                Take a quick look before moving forward.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <FiEdit className="text-4xl text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter and Table Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-yellow-500 pl-4">
                        Daftar MEMO
                    </h2>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Area
                            </label>
                            <select
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="all">All Areas</option>
                                {areas.map((area) => (
                                    <option key={area.id} value={area.id}>
                                        {area.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Kategori
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={applyFilter}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <FiFilter className="text-xl" />
                                Apply Filter
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold">No</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Judul Dokumen</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Kategori</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Periode</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Area</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {documents.length > 0 ? (
                                    documents.map((doc, index) => (
                                        <tr
                                            key={doc.id}
                                            className="hover:bg-blue-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {doc.judul}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {doc.category?.nama || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {formatDate(doc.periode_mulai)} -{" "}
                                                {formatDate(doc.periode_selesai)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {doc.area?.nama || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                                                        doc.status
                                                    )}`}
                                                >
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openReviewModal(doc)}
                                                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                                                        title="Review"
                                                    >
                                                        <FiEdit className="text-lg" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(doc.id)}
                                                        className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all"
                                                        title="Download"
                                                    >
                                                        <FiDownload className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <FiEdit className="text-4xl text-gray-400" />
                                                </div>
                                                <p className="text-lg font-semibold">
                                                    No documents available for review
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-8 py-6 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <FiEdit className="text-3xl" />
                                <h2 className="text-2xl font-bold">REVIEW</h2>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Document Preview */}
                                <div>
                                    <div className="border-2 border-gray-200 rounded-xl p-8 h-80 flex items-center justify-center bg-gray-50">
                                        <div className="text-center">
                                            <div className="text-6xl font-black text-gray-800 mb-2">
                                                DOKUMEN
                                            </div>
                                            <div className="text-5xl font-black text-gray-800">
                                                MEMO
                                            </div>
                                            <div className="mt-4 text-sm text-gray-600">
                                                {selectedDocument.judul}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes and Label */}
                                <div className="space-y-6">
                                    {/* Notes Section */}
                                    <div>
                                        <label className="block text-lg font-bold text-gray-800 mb-3">
                                            NOTES
                                        </label>
                                        <textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Add your review notes here..."
                                            rows="6"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        />
                                    </div>

                                    {/* Label/Status Section */}
                                    <div>
                                        <label className="block text-lg font-bold text-gray-800 mb-3">
                                            Label
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="Revision by CCH">Revision by CCH</option>
                                            <option value="Accept by CCH">Accept by CCH</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Previous Feedbacks */}
                            {selectedDocument.feedbacks && selectedDocument.feedbacks.length > 0 && (
                                <div className="mt-6 border-t-2 border-gray-200 pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                                        Previous Feedback History
                                    </h3>
                                    <div className="space-y-3 max-h-40 overflow-y-auto">
                                        {selectedDocument.feedbacks.map((feedback, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-sm text-gray-700">
                                                        {feedback.user?.nama || "Unknown"}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(feedback.created_at).toLocaleDateString(
                                                            "id-ID"
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {feedback.message}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 pb-8 flex gap-4 justify-end">
                            <button
                                onClick={closeReviewModal}
                                className="px-8 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveReview}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CCHLayout>
    );
}