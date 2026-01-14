import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import AreaLayout from "../../../Layouts/AreaLayout";
import EditDocumentModal from "./EditDocumentModal";
import { FiEdit2, FiDownload, FiFilter } from "react-icons/fi";

export default function Home() {
    const { auth, documents, categories, areas, statuses, filters, flash } = usePage().props;
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [categoryFilter, setCategoryFilter] = useState(filters.category || "");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Update filters when props change
    useEffect(() => {
        setStatusFilter(filters.status || "");
        setCategoryFilter(filters.category || "");
    }, [filters]);

    const handleFilterChange = () => {
        const params = {};
        
        if (statusFilter) {
            params.status = statusFilter;
        }
        
        if (categoryFilter) {
            params.category = categoryFilter;
        }
        
        router.get(route("amo-area.home"), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilter = () => {
        setStatusFilter("");
        setCategoryFilter("");
        router.get(route("amo-area.home"), {}, {
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

    const handleDownload = (documentId) => {
        window.location.href = route("amo-area.download-document", documentId);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <AreaLayout>
            <div className="space-y-6">
                {/* Success Message */}
                {flash?.success && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md flex items-center animate-fade-in">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="ml-3 text-green-800 font-medium">{flash.success}</p>
                    </div>
                )}

                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 opacity-10 rounded-full -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 opacity-10 rounded-full -ml-32 -mb-32"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold text-white mb-2">
                            Welcome Back, {auth.user.nama}
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Here's what's happening with your MEMO
                        </p>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header with Filters */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b-2 border-blue-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-900 to-yellow-500 rounded-full mr-3"></div>
                                Daftar MEMO
                            </h2>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                                >
                                    <option value="">All Status</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kategori
                                </label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
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

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 opacity-0">
                                    Action
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleFilterChange}
                                        className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-900 to-blue-800 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <FiFilter className="text-lg" />
                                        Apply Filter
                                    </button>
                                    {(statusFilter || categoryFilter) && (
                                        <button
                                            onClick={handleResetFilter}
                                            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                                            title="Reset Filter"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Active Filter Badges */}
                        {(statusFilter || categoryFilter) && (
                            <div className="mt-4 flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-600">
                                    Active Filters:
                                </span>
                                {statusFilter && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                        Status: {statusFilter}
                                    </span>
                                )}
                                {categoryFilter && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                                        Category: {categories.find(c => c.id == categoryFilter)?.nama}
                                    </span>
                                )}
                            </div>
                        )}
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
                                {documents.length > 0 ? (
                                    documents.map((doc, index) => (
                                        <tr
                                            key={doc.id}
                                            className="hover:bg-blue-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                {index + 1}
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
                                                    <button
                                                        onClick={() => handleEdit(doc)}
                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 className="text-blue-900 text-lg group-hover:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(doc.id)}
                                                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors duration-200 group"
                                                        title="Download"
                                                    >
                                                        <FiDownload className="text-yellow-600 text-lg group-hover:scale-110 transition-transform" />
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
                                                    {(statusFilter || categoryFilter) 
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

                    {/* Footer Stats */}
                    {documents.length > 0 && (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t-2 border-blue-100">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-700">
                                    Total Documents:{" "}
                                    <span className="text-blue-900 font-bold">
                                        {documents.length}
                                    </span>
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <span className="text-xs text-gray-600">
                                            On Process:{" "}
                                            {
                                                documents.filter(
                                                    (d) => d.status === "On Process"
                                                ).length
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                        <span className="text-xs text-gray-600">
                                            Accepted:{" "}
                                            {
                                                documents.filter((d) =>
                                                    d.status.includes("Accept")
                                                ).length
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                        <span className="text-xs text-gray-600">
                                            Draft:{" "}
                                            {
                                                documents.filter((d) => d.status === "Draft")
                                                    .length
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <EditDocumentModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                document={selectedDocument}
                areas={areas}
                categories={categories}
            />
        </AreaLayout>
    );
}