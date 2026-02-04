import React from "react";
import { usePage } from "@inertiajs/react";
import { HiUser } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";

const Header = ({ toggleSidebar }) => {
    const { auth } = usePage().props;

    return (
        <header className="fixed top-0 right-0 left-0 md:left-72 z-30 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="px-6 py-3.5">
                <div className="flex items-center justify-between md:justify-end">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <FiMenu className="text-2xl" />
                    </button>

                    <div className="flex items-center justify-end">
                        {/* Profile */}
                        <div className="relative">
                            <div className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                                    <HiUser className="text-white text-lg" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {auth?.user?.nama || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {auth?.user?.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;