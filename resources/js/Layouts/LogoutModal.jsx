import React, { useState } from "react";
import { TbLogout } from "react-icons/tb";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { RiLogoutCircleLine } from "react-icons/ri";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Enhanced Backdrop */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-blue-900/30 to-gray-900/50 backdrop-blur-md transition-all duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-[90%] max-w-[320px] sm:max-w-md transform transition-all animate-modal-appear overflow-hidden">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group z-10"
                    aria-label="Close"
                >
                    <IoClose className="text-xl sm:text-2xl text-gray-400 group-hover:text-gray-700 group-hover:rotate-90 transition-all duration-300" />
                </button>

                {/* Content */}
                <div className="p-6 sm:p-8 pt-8 sm:pt-10 text-center">
                    {/* Animated Icon Container */}
                    <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse-slow"></div>

                        {/* Inner Circle */}
                        <div className="absolute inset-2 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg animate-icon-bounce">
                            <RiLogoutCircleLine className="text-white text-3xl sm:text-4xl" />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                        Konfirmasi Logout
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-base leading-relaxed mb-8 px-2">
                        Apakah Anda yakin ingin keluar dari aplikasi?
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                        >
                            <span className="relative z-10">Ya, Logout</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>
                    </div>
                </div>

                {/* Bottom Accent */}
                <div className="h-2 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
            </div>

            <style>{`
                @keyframes modal-appear {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                @keyframes icon-bounce {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }
                
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.05);
                    }
                }
                
                .animate-modal-appear {
                    animation: modal-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .animate-icon-bounce {
                    animation: icon-bounce 2s ease-in-out infinite;
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LogoutModal;