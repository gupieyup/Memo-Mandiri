import React, { useState, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast, Toaster } from "sonner";

export default function Login() {
    const { errors: pageErrors, flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const errorShownRef = useRef(false);
    const errorTimeoutRef = useRef(null);

    // Check for errors from page props (after redirect)
    useEffect(() => {
        // Clear timeout sebelumnya jika ada
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = null;
        }

        // Cek apakah ada error dari pageErrors atau flash
        const hasPageError = pageErrors && Object.keys(pageErrors).length > 0;
        const hasFlashError = flash && flash.error;

        if (!hasPageError && !hasFlashError) {
            // Reset flag jika tidak ada error
            errorShownRef.current = false;
            return;
        }

        // Hanya tampilkan jika belum pernah ditampilkan
        if (!errorShownRef.current) {
            errorShownRef.current = true;

            // Prioritaskan error dari pageErrors, jika tidak ada gunakan flash.error
            let errorMessage = "Email atau Password Salah";
            if (hasPageError) {
                errorMessage = pageErrors.email || pageErrors.password || Object.values(pageErrors)[0] || errorMessage;
            } else if (hasFlashError) {
                errorMessage = flash.error;
            }

            // Gunakan timeout untuk debounce dan memastikan hanya satu toast
            errorTimeoutRef.current = setTimeout(() => {
                toast.error("Login Gagal", {
                    description: errorMessage,
                    duration: 5000,
                });
            }, 50);
        }

        // Cleanup
        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, [pageErrors, flash]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email tidak boleh kosong";
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Format email tidak valid";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password tidak boleh kosong";
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validasi client-side
        if (!validateForm()) {
            return;
        }

        setProcessing(true);
        errorShownRef.current = false; // Reset flag on new submit
        const formDataToSend = new FormData();
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);

        router.post("/actionLogin", formDataToSend, {
            onError: (errors) => {
                setProcessing(false);
                // Jangan tampilkan toast di sini, biarkan useEffect yang handle
                // Karena setelah redirect, error akan tersedia di pageErrors atau flash
                hasShownError.current = false; // Reset agar useEffect bisa trigger
            },
            onSuccess: () => {
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, email: value }));
        if (validationErrors.email) {
            setValidationErrors((prev) => ({ ...prev, email: "" }));
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, password: value }));
        if (validationErrors.password) {
            setValidationErrors((prev) => ({ ...prev, password: "" }));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !processing) {
            handleSubmit(e);
        }
    };

    return (
        <>
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4 relative">
                {/* Background Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
                    <div
                        className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
                        style={{ animationDelay: "1s" }}
                    ></div>
                </div>

                <div className="w-full max-w-[90%] md:max-w-md relative z-10">
                    {/* Login Card */}
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 md:px-8 md:py-10 text-center relative">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                <div className="absolute top-4 left-4 w-16 h-16 md:w-20 md:h-20 border-4 border-yellow-400 rounded-full"></div>
                                <div className="absolute bottom-4 right-4 w-12 h-12 md:w-16 md:h-16 border-4 border-yellow-400 rounded-full"></div>
                            </div>

                            {/* Logo Placeholder */}
                            <div className="mb-4 flex justify-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                        <img
                                            src="/logo-memo.png"
                                            alt="MEMO Logo"
                                            className="w-10 h-10 md:w-12 md:h-12"
                                        />
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                Selamat Datang
                            </h1>
                            <p className="text-blue-100 text-xs md:text-sm">
                                Masuk ke akun MEMO Anda
                            </p>
                        </div>

                        {/* Form Section */}
                        <div className="px-6 py-6 md:px-8 md:py-8">
                            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                                {/* Email Input */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-xs md:text-sm font-semibold text-gray-700 mb-2"
                                    >
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleEmailChange}
                                            onKeyPress={handleKeyPress}
                                            className={`w-full pl-12 pr-4 py-3 md:py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.email
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                                                } text-sm md:text-base`}
                                            placeholder="nama@email.com"
                                        />
                                    </div>
                                    {validationErrors.email && (
                                        <p className="mt-2 text-xs md:text-sm text-red-600 flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {validationErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-xs md:text-sm font-semibold text-gray-700 mb-2"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handlePasswordChange}
                                            onKeyPress={handleKeyPress}
                                            className={`w-full pl-12 pr-12 py-3 md:py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.password
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                                                } text-sm md:text-base`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {validationErrors.password && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {validationErrors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                                >
                                    {processing ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Masuk
                                            <svg
                                                className="ml-2 w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}