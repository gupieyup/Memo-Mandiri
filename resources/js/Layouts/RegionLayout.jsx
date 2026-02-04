import React, { useState } from "react";
import { router } from "@inertiajs/react";
import RegionSidebar from "./RegionSidebar";
import Header from "./Header";
import LogoutModal from "./LogoutModal";

const RegionLayout = ({ children }) => {
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
                <RegionSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    handleLogout={() => setShowLogoutModal(true)}
                />
                <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden">
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

export default RegionLayout;