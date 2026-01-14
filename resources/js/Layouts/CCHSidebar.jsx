import React from "react";
import { usePage } from "@inertiajs/react";
import { FiUpload } from "react-icons/fi";
import { MdOutlineReviews } from "react-icons/md";
import { TbLogout } from "react-icons/tb";

const CCHSidebar = ({ handleLogout }) => {
    const { url } = usePage();
    
    const menuItems = [
        { href: "/cch/review", icon: MdOutlineReviews, label: "Review" },
        {
            href: "/cch/upload-signature",
            icon: FiUpload,
            label: "Upload Signature",
        },
    ];

    return (
        <aside
            className="fixed top-0 left-0 z-40 w-72 h-screen transition-transform -translate-x-full sm:translate-x-0"
            aria-label="Sidebar"
        >
            <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 border-r border-gray-200 shadow-xl">
                {/* Logo Section */}
                <div className="px-6 py-7 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-center mb-5">
                        <div className="relative">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow p-2">
                                <img
                                    src="/logo-memo.png"
                                    alt="MEMO Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-md"></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="font-bold text-xl text-gray-800 tracking-wide mb-1">
                            MEMO APP
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <div className="px-4 py-6 flex-1">
                    <nav className="space-y-2">
                        {menuItems.map((item, index) => {
                            const IconComponent = item.icon;
                            const isActive = url.startsWith(item.href);

                            return (
                                <a
                                    key={index}
                                    href={item.href}
                                    className={`group flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 relative ${
                                        isActive
                                            ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200/50 scale-[1.02]"
                                            : "hover:bg-white/80 hover:shadow-md hover:scale-[1.01]"
                                    }`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 mr-3 ${
                                            isActive
                                                ? "bg-white/20"
                                                : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-blue-200"
                                        }`}
                                    >
                                        <IconComponent
                                            className={`text-lg transition-colors duration-300 ${
                                                isActive
                                                    ? "text-white"
                                                    : "text-gray-700 group-hover:text-blue-600"
                                            }`}
                                        />
                                    </div>
                                    <span
                                        className={`font-semibold text-sm tracking-wide transition-colors duration-300 ${
                                            isActive
                                                ? "text-white"
                                                : "text-gray-700 group-hover:text-blue-600"
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <>
                                            <div className="ml-auto w-1.5 h-7 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full shadow-sm"></div>
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-r-full shadow-md"></div>
                                        </>
                                    )}
                                </a>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout Button */}
                <div className="px-4 pb-6">
                    <button
                        onClick={handleLogout}
                        className="group flex items-center w-full px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:scale-[1.01] border border-gray-200 hover:border-red-300 hover:shadow-md bg-white/50"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-red-100 group-hover:to-red-200 transition-all duration-300 mr-3">
                            <TbLogout className="text-gray-700 group-hover:text-red-600 text-lg transition-colors" />
                        </div>
                        <span className="font-semibold text-sm tracking-wide text-gray-700 group-hover:text-red-600 transition-colors">
                            Logout
                        </span>
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-32 right-4 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-32 left-4 w-20 h-20 bg-yellow-200/20 rounded-full blur-2xl pointer-events-none"></div>
            </div>
        </aside>
    );
};

export default CCHSidebar;