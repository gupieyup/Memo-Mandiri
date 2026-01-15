import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import MOLayout from "../../../Layouts/MOLayout";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { toast, Toaster } from "sonner";

export default function ManageAccount({ auth, users, areas }) {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        nama: "",
        email: "",
        password: "",
        role: "AMO Area",
        area_id: "",
        area_ids: [],
    });

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

    const openAddModal = () => {
        setSelectedUser(null);
        setFormData({
            nama: "",
            email: "",
            password: "",
            role: "AMO Area",
            area_id: "",
            area_ids: [],
        });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            nama: user.nama,
            email: user.email,
            password: "",
            role: user.role,
            area_id: user.area_id || "",
            area_ids: user.areas ? user.areas.map((areaName) => {
                const area = areas.find(a => a.nama === areaName);
                return area ? area.id : null;
            }).filter(id => id !== null) : [],
        });
        setShowModal(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({
            nama: "",
            email: "",
            password: "",
            role: "AMO Area",
            area_id: "",
            area_ids: [],
        });
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedUser(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (formData.role === "AMO Area" && !formData.area_id) {
            toast.error("Please select an area", {
                duration: 3000,
            });
            return;
        }

        if (formData.role === "AMO Region" && formData.area_ids.length === 0) {
            toast.error("Please select at least one area", {
                duration: 3000,
            });
            return;
        }

        const submitData = {
            nama: formData.nama,
            email: formData.email,
            role: formData.role,
        };

        if (formData.password) {
            submitData.password = formData.password;
        }

        if (formData.role === "AMO Area") {
            submitData.area_id = formData.area_id;
        } else {
            submitData.area_ids = formData.area_ids;
        }

        if (selectedUser) {
            // Update
            router.post(`/mo/manage-account/${selectedUser.id}`, {
                ...submitData,
                _method: "PUT",
            }, {
                onSuccess: () => {
                    closeModal();
                },
                onError: (errors) => {
                    if (errors.message) {
                        toast.error(errors.message, {
                            duration: 3000,
                        });
                    }
                },
            });
        } else {
            // Create
            router.post("/mo/manage-account", submitData, {
                onSuccess: () => {
                    closeModal();
                },
                onError: (errors) => {
                    if (errors.message) {
                        toast.error(errors.message, {
                            duration: 3000,
                        });
                    }
                },
            });
        }
    };

    const handleDelete = () => {
        if (selectedUser) {
            router.delete(`/mo/manage-account/${selectedUser.id}`, {
                onSuccess: () => {
                    closeDeleteModal();
                },
            });
        }
    };

    const handleAreaIdsChange = (areaId) => {
        const areaIdNum = parseInt(areaId);
        if (formData.area_ids.includes(areaIdNum)) {
            setFormData({
                ...formData,
                area_ids: formData.area_ids.filter(id => id !== areaIdNum),
            });
        } else {
            setFormData({
                ...formData,
                area_ids: [...formData.area_ids, areaIdNum],
            });
        }
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
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-white mb-2">
                                The Crew
                            </h1>
                            <p className="text-blue-200 text-lg">
                                Everything you need to manage user accounts.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <FiEdit className="text-4xl text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-yellow-500 pl-4">
                            User Management
                        </h2>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <FiPlus className="text-lg" />
                            Add User
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold">No</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Password</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Area</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users && users.length > 0 ? (
                                    users.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-blue-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {user.nama}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                                                {user.password}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    user.role === 'AMO Area' 
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                        : 'bg-purple-100 text-purple-800 border border-purple-300'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {user.area_names || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all"
                                                        title="Edit"
                                                    >
                                                        <FiEdit className="text-lg" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="text-lg" />
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
                                                <p className="text-lg font-semibold text-gray-600 mb-1">
                                                    No Users Found
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Click "Add User" to create a new user account
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-8 py-6 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FiEdit className="text-3xl" />
                                <h2 className="text-2xl font-bold">
                                    {selectedUser ? "EDIT USER" : "ADD USER"}
                                </h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <FiX className="text-2xl" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter user name"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter email address"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password {!selectedUser && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!selectedUser}
                                        minLength={6}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder={selectedUser ? "Leave blank to keep current password" : "Enter password (min 6 characters)"}
                                    />
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                role: e.target.value,
                                                area_id: "",
                                                area_ids: [],
                                            });
                                        }}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="AMO Area">AMO Area</option>
                                        <option value="AMO Region">AMO Region</option>
                                    </select>
                                </div>

                                {/* Area Selection */}
                                {formData.role === "AMO Area" ? (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Area <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.area_id}
                                            onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Select Area</option>
                                            {areas && areas.map((area) => (
                                                <option key={area.id} value={area.id}>
                                                    {area.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Areas <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border-2 border-gray-300 rounded-xl p-4 max-h-48 overflow-y-auto">
                                            {areas && areas.length > 0 ? (
                                                <div className="space-y-2">
                                                    {areas.map((area) => (
                                                        <label
                                                            key={area.id}
                                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.area_ids.includes(area.id)}
                                                                onChange={() => handleAreaIdsChange(area.id)}
                                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700">{area.nama}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No areas available</p>
                                            )}
                                        </div>
                                        {formData.area_ids.length === 0 && (
                                            <p className="text-xs text-red-500 mt-1">Please select at least one area</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-8 pb-8 flex gap-4 justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-8 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                                >
                                    {selectedUser ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-6 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <FiTrash2 className="text-3xl" />
                                <h2 className="text-2xl font-bold">DELETE USER</h2>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to delete user <strong>{selectedUser.nama}</strong>?
                            </p>
                            <p className="text-sm text-gray-500">
                                This action cannot be undone.
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 pb-8 flex gap-4 justify-end">
                            <button
                                onClick={closeDeleteModal}
                                className="px-8 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MOLayout>
    );
}
