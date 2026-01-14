import React, { useState } from "react";
import { router } from "@inertiajs/react";
import CCHSidebar from "./CCHSidebar";
import Header from "./Header";
import LogoutModal from "./LogoutModal";

const CCHLayout = ({ children }) => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        router.post("/logout");
        setShowLogoutModal(false);
    };

    return (
        <>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <CCHSidebar handleLogout={() => setShowLogoutModal(true)} />
                <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden">
                    <Header />
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

export default CCHLayout;