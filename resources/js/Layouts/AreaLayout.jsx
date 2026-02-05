import React, { useState } from "react";
import { router } from "@inertiajs/react";
import AreaSidebar from "./AreaSidebar";
import Header from "./Header";
import LogoutModal from "./LogoutModal";

const AreaLayout = ({ children }) => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        router.post("/logout");
        setShowLogoutModal(false);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <AreaSidebar
                    handleLogout={() => setShowLogoutModal(true)}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden transition-all duration-300">
                    <Header toggleSidebar={toggleSidebar} />
                    <div className="flex-1 overflow-y-auto pt-28 px-6 pb-6">
                        {children}
                    </div>
                </main>
            </div>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </>
    );
};

export default AreaLayout;