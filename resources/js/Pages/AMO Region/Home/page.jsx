import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import RegionLayout from "../../../Layouts/RegionLayout";
import EditDocumentModal from "./EditDocumentModal";
import { FiEdit2, FiDownload, FiSearch, FiEye } from "react-icons/fi";
import { toast, Toaster } from "sonner";

export default function Home() {
    const { auth, documents, categories, areas, statuses, filters, flash } = usePage().props;
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [categoryFilter, setCategoryFilter] = useState(filters.category || "");
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Update filters when props change
    useEffect(() => {
        if (filters) {
            setStatusFilter(filters.status || "");
            setCategoryFilter(filters.category || "");
            setSearchQuery(filters.search || "");
            setPerPage(filters.per_page || 10);
        }
    }, [filters]);

    // Update selectedDocument when documents are reloaded
    useEffect(() => {
        if (selectedDocument && documents) {
            const updatedDocument = documents.find(doc => doc.id === selectedDocument.id);
            if (updatedDocument) {
                setSelectedDocument(updatedDocument);
            }
        }
    }, [documents]);

    const handleFilterChange = () => {
        const params = {};
        
        if (statusFilter) {
            params.status = statusFilter;
        }
        
        if (categoryFilter) {
            params.category = categoryFilter;
        }
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = perPage;
        
        router.get("/amo-region/home", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        const params = {};
        
        params.status = value;
        
        if (categoryFilter) {
            params.category = categoryFilter;
        }
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = perPage;
        
        router.get("/amo-region/home", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCategoryChange = (value) => {
        setCategoryFilter(value);
        const params = {};
        
        if (statusFilter) {
            params.status = statusFilter;
        }
        
        params.category = value;
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = perPage;
        
        router.get("/amo-region/home", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        const params = {};
        
        if (statusFilter) {
            params.status = statusFilter;
        }
        
        if (categoryFilter) {
            params.category = categoryFilter;
        }
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = perPage;
        
        router.get("/amo-region/home", params, {
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
        
        if (categoryFilter) {
            params.category = categoryFilter;
        }
        
        if (searchQuery) {
            params.search = searchQuery;
        }
        
        params.per_page = newPerPage;
        
        router.get("/amo-region/home", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilter = () => {
        setStatusFilter("");
        setCategoryFilter("");
        setSearchQuery("");
        router.get("/amo-region/home", {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleEdit = (document) => {
        setSelectedDocument(document);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedDocument(null);
    };

    const getDownloadUrl = (documentId) => `/amo-region/download-document/${documentId}`;
    const notifyDownload = () => {
        toast.success("Download Berhasil", {
            description: "Dokumen berhasil disimpan ke dalam penyimpanan anda.",
            duration: 3000,
        });
    };

    const getStatusColor = (status) => {
        const statusColors = {
            Draft: "bg-gray-100 text-gray-700 border-gray-300",
            "On Process": "bg-yellow-50 text-yellow-700 border-yellow-300",
            "Revision by AMO Region": "bg-red-50 text-red-700 border-red-300",
            "Revision by MO": "bg-red-50 text-red-700 border-red-300",
            "Revision by CCH": "bg-red-50 text-red-700 border-red-300",
            "Accept by AMO Region": "bg-green-50 text-green-700 border-green-300",
            "Accept by MO": "bg-blue-50 text-blue-700 border-blue-300",
            "Accept by CCH": "bg-emerald-50 text-emerald-700 border-emerald-300",
        };
        return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-300";
    };

    const canEditDocument = (status) => {
        const editableStatuses = [
            "Draft",
            "On Process",
            "Revision by AMO Region",
            "Revision by MO",
            "Revision by CCH",
        ];
        return editableStatuses.includes(status);
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
        <RegionLayout>
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
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl p-5 mb-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 opacity-10 rounded-full -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 opacity-10 rounded-full -ml-32 -mb-32"></div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-extrabold text-white mb-2">
                            All Your Memos
                        </h1>
                        <p className="text-blue-100 text-md">
                            Here's what's happening with your MEMO
                        </p>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header with Filters */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b-2 border-blue-100">
                        {/* Filters */}
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
                                    {statuses.filter(status => 
                                        status !== 'Revision by AMO Region' && 
                                        status !== 'Accept by AMO Region'
                                    ).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kategori
                                </label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-5">
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
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 opacity-0">
                                    Action
                                </label>
                                {(statusFilter || categoryFilter || searchQuery) && (
                                    <button
                                        onClick={handleResetFilter}
                                        className="w-full px-3 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300 text-sm"
                                        title="Reset Filter"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b-2 border-blue-100">
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
                                                    if (categoryFilter) params.category = categoryFilter;
                                                    if (searchQuery) params.search = searchQuery;
                                                    params.per_page = perPage;
                                                    router.get("/amo-region/home", params, {
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
                                                    if (categoryFilter) params.category = categoryFilter;
                                                    if (searchQuery) params.search = searchQuery;
                                                    params.per_page = perPage;
                                                    router.get("/amo-region/home", params, {
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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold">No</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">
                                        Judul Dokumen
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">
                                        Periode
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Area</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-bold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {documents?.data && documents.data.length > 0 ? (
                                    documents.data.map((doc, index) => {
                                        const rowNumber = (documents.current_page - 1) * documents.per_page + index + 1;
                                        return (
                                        <tr
                                            key={doc.id}
                                            className="hover:bg-blue-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                {rowNumber}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                                                {doc.judul}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {doc.category.nama}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {formatDate(doc.periode_mulai)} -{" "}
                                                {formatDate(doc.periode_selesai)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {doc.area.nama}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(
                                                        doc.status
                                                    )}`}
                                                >
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {canEditDocument(doc.status) ? (
                                                        <button
                                                            onClick={() => handleEdit(doc)}
                                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 className="text-blue-900 text-lg group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEdit(doc)}
                                                            className="p-2 hover:bg-green-100 rounded-lg transition-colors duration-200 group"
                                                            title="View"
                                                        >
                                                            <FiEye className="text-green-700 text-lg group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                    <a
                                                        href={getDownloadUrl(doc.id)}
                                                        onClick={notifyDownload}
                                                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors duration-200 group"
                                                        title="Download"
                                                    >
                                                        <FiDownload className="text-yellow-600 text-lg group-hover:scale-110 transition-transform" />
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
                                                    <svg
                                                        className="w-10 h-10 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-lg font-semibold text-gray-600 mb-1">
                                                    No Documents Found
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {(statusFilter || categoryFilter || searchQuery) 
                                                        ? "No documents match your filter criteria"
                                                        : "Start by uploading your first MEMO document"
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

            {/* Edit Modal */}
            <EditDocumentModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                document={selectedDocument}
                areas={areas}
                categories={categories}
                canEdit={selectedDocument ? canEditDocument(selectedDocument.status) : false}
            />
        </RegionLayout>
    );
}