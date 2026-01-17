import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import MOLayout from "../../../Layouts/MOLayout";
import { FiDownload, FiEdit, FiSearch, FiFile } from "react-icons/fi";
import { toast, Toaster } from "sonner";

export default function Review({ auth, documents, areas, categories, statuses, filters }) {
    const { flash } = usePage().props;
    const [selectedArea, setSelectedArea] = useState(filters?.area_id || "all");
    const [selectedCategory, setSelectedCategory] = useState(filters?.category_id || "all");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "");
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [reviewNotes, setReviewNotes] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    // Show toast notifications for flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 3000,
            });
        }
        if (flash?.error) {
            toast.error(flash.error, {
                duration: 3000,
            });
        }
    }, [flash]);

    // Update filters when props change
    useEffect(() => {
        if (filters) {
            setSelectedArea(filters.area_id || "all");
            setSelectedCategory(filters.category_id || "all");
            setStatusFilter(filters.status || "");
            setSearchQuery(filters.search || "");
            setPerPage(filters.per_page || 10);
        }
    }, [filters]);

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        const params = {};
        
        if (value) {
            params.status = value;
        }
        
        if (selectedArea && selectedArea !== "all") {
            params.area_id = selectedArea;
        }
        
        if (selectedCategory && selectedCategory !== "all") {
            params.category_id = selectedCategory;
        }
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = perPage;
        
        router.get("/mo/review", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        const params = {};
        
        if (statusFilter) {
            params.status = statusFilter;
        }
        
        if (selectedArea && selectedArea !== "all") {
            params.area_id = selectedArea;
        }
        
        if (value && value !== "all") {
            params.category_id = value;
        }
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = perPage;
        
        router.get("/mo/review", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleAreaChange = (value) => {
        setSelectedArea(value);
        const params = {};
        
        if (statusFilter) {
            params.status = statusFilter;
        }
        
        if (selectedCategory && selectedCategory !== "all") {
            params.category_id = selectedCategory;
        }
        
        if (value && value !== "all") {
            params.area_id = value;
        }
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = perPage;
        
        router.get("/mo/review", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        const params = {};
        
        if (statusFilter) {
            params.status = statusFilter;
        }
        
        if (selectedArea && selectedArea !== "all") {
            params.area_id = selectedArea;
        }
        
        if (selectedCategory && selectedCategory !== "all") {
            params.category_id = selectedCategory;
        }
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = perPage;
        
        router.get("/mo/review", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        const params = {};
        
        if (statusFilter) {
            params.status = statusFilter;
        }
        
        if (selectedArea && selectedArea !== "all") {
            params.area_id = selectedArea;
        }
        
        if (selectedCategory && selectedCategory !== "all") {
            params.category_id = selectedCategory;
        }
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = newPerPage;
        
        router.get("/mo/review", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilter = () => {
        setSelectedArea("all");
        setSelectedCategory("all");
        setStatusFilter("");
        setSearchQuery("");
        router.get("/mo/review", {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getDownloadUrl = (documentId) => `/mo/download-review-document/${documentId}`;
    
    const notifyDownload = () => {
        toast.success("Download Berhasil", {
            description: "Dokumen berhasil disimpan ke dalam penyimpanan anda.",
            duration: 3000,
        });
    };

    const getPreviewUrl = (doc) => {
        if (!doc || !doc.id) return null;
        return `/mo/preview-review-document/${doc.id}`;
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

        if (!selectedStatus) {
            toast.error("Pilih status terlebih dahulu", {
                duration: 3000,
            });
            return;
        }

        router.post(
            `/mo/update-review-status/${selectedDocument.id}`,
            {
                status: selectedStatus,
                notes: reviewNotes,
            },
            {
                onSuccess: () => {
                    toast.success("Review berhasil disimpan", {
                        description: "Status dokumen telah diperbarui.",
                        duration: 3000,
                    });
                    closeReviewModal();
                },
                onError: (errors) => {
                    toast.error("Gagal menyimpan review", {
                        description: errors.message || "Terjadi kesalahan saat menyimpan review.",
                        duration: 3000,
                    });
                },
            }
        );
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Accept by AMO Region":
                return "bg-yellow-100 text-yellow-800 border border-yellow-300";
            case "Revision by MO":
                return "bg-red-100 text-red-800 border border-red-300";
            case "Accept by MO":
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
        <MOLayout>
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
            <div className="h-full">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl p-5 mb-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 opacity-10 rounded-full -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 opacity-10 rounded-full -ml-32 -mb-32"></div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-extrabold text-white mb-2">
                            Review Time
                        </h1>
                        <p className="text-blue-100 text-md">
                            Take a quick look before moving forward.
                        </p>
                    </div>
                </div>

                {/* Filter and Table Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-yellow-500 pl-4">
                        Daftar MEMO
                    </h2>

                    {/* Filters */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b-2 border-blue-100 mb-6 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                                >
                                    <option value="">All Status</option>
                                    {statuses && statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Area
                                </label>
                                <select
                                    value={selectedArea}
                                    onChange={(e) => handleAreaChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                                >
                                    <option value="all">All Areas</option>
                                    {areas && areas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kategori
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                                >
                                    <option value="all">All Categories</option>
                                    {categories && categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Cari Judul
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch();
                                                }
                                            }}
                                            placeholder="Cari judul dokumen..."
                                            className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        className="px-4 py-2.5 bg-gradient-to-r from-blue-900 to-blue-800 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                                        title="Cari"
                                    >
                                        <FiSearch className="text-lg" />
                                    </button>
                                    {(statusFilter || (selectedArea && selectedArea !== "all") || (selectedCategory && selectedCategory !== "all") || searchQuery) && (
                                        <button
                                            onClick={handleResetFilter}
                                            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300 text-sm whitespace-nowrap"
                                            title="Reset Filter"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b-2 border-blue-100 mb-6 rounded-xl">
                        <div className="flex flex-col md:flex-row items-center justify-end gap-4">
                            {/* Per Page Selector */}
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-semibold text-gray-700">
                                    Tampilkan:
                                </label>
                                <select
                                    value={perPage}
                                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            {/* Pagination Info and Controls */}
                            {documents?.data && documents.data.length > 0 ? (
                                <>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {documents.from} - {documents.to} dari {documents.total}
                                    </p>
                                    {documents.last_page > 1 && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const params = { page: documents.current_page - 1 };
                                                    if (statusFilter) params.status = statusFilter;
                                                    if (selectedArea && selectedArea !== "all") params.area_id = selectedArea;
                                                    if (selectedCategory && selectedCategory !== "all") params.category_id = selectedCategory;
                                                    if (searchQuery) params.search = searchQuery;
                                                    params.per_page = perPage;
                                                    router.get("/mo/review", params, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }}
                                                disabled={documents.current_page === 1}
                                                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-gray-700"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-4 py-2 bg-blue-900 text-white rounded-xl font-semibold">
                                                {documents.current_page} / {documents.last_page}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const params = { page: documents.current_page + 1 };
                                                    if (statusFilter) params.status = statusFilter;
                                                    if (selectedArea && selectedArea !== "all") params.area_id = selectedArea;
                                                    if (selectedCategory && selectedCategory !== "all") params.category_id = selectedCategory;
                                                    if (searchQuery) params.search = searchQuery;
                                                    params.per_page = perPage;
                                                    router.get("/mo/review", params, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }}
                                                disabled={documents.current_page === documents.last_page}
                                                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-gray-700"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm font-semibold text-gray-700">
                                    {documents?.total || 0} dokumen
                                </p>
                            )}
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
                                {documents?.data && documents.data.length > 0 ? (
                                    documents.data.map((doc, index) => {
                                        const rowNumber = (documents.current_page - 1) * documents.per_page + index + 1;
                                        return (
                                        <tr
                                            key={doc.id}
                                            className="hover:bg-blue-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {rowNumber}
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
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeClass(
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
                                                    <a
                                                        href={getDownloadUrl(doc.id)}
                                                        onClick={notifyDownload}
                                                        className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all"
                                                        title="Download"
                                                    >
                                                        <FiDownload className="text-lg" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })
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
                                                <p className="text-lg font-semibold text-gray-600 mb-1">
                                                    No Documents Found
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {(statusFilter || (selectedArea && selectedArea !== "all") || (selectedCategory && selectedCategory !== "all") || searchQuery) 
                                                        ? "No documents match your filter criteria"
                                                        : "No documents available for review"
                                                    }
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
                                <div className="bg-gray-50 rounded-xl p-2.5 border-2 border-gray-200 flex flex-col">
                                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <FiFile className="text-blue-900" /> Preview Dokumen
                                    </h4>
                                    {getPreviewUrl(selectedDocument) ? (
                                        <div className="w-full flex-1 min-h-[400px] border rounded-lg overflow-hidden bg-white">
                                            <iframe
                                                title="Document Preview"
                                                src={`${getPreviewUrl(selectedDocument)}#toolbar=0&navpanes=0`}
                                                className="w-full h-full"
                                                style={{
                                                    display: 'block',
                                                    border: 'none',
                                                    margin: 0,
                                                    padding: 0
                                                }}
                                                scrolling="yes"
                                                frameBorder="0"
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <div className="w-full flex-1 min-h-[400px] flex flex-col items-center justify-center text-center text-gray-500 bg-white rounded-lg border border-dashed">
                                            <FiFile className="text-4xl mb-2" />
                                            <p className="text-sm">Belum ada dokumen untuk dipreview</p>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        File: {selectedDocument.file_name || "-"}
                                    </p>
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
                                            <option value="Revision by MO">Revision by MO</option>
                                            <option value="Accept by MO">Accept by MO</option>
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
        </MOLayout>
    );
}
