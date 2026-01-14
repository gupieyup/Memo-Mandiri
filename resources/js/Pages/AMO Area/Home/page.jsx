import React from "react";
import AreaLayout from "../../../Layouts/AreaLayout";

export default function Home() {
    return (
        <AreaLayout>
            <div className="h-full bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center rounded-2xl">
                <div className="bg-white rounded-2xl shadow-xl px-10 py-8 text-center">
                    <h1 className="text-4xl font-extrabold text-blue-600 mb-2">
                        HOME
                    </h1>
                </div>
            </div>
        </AreaLayout>
    );
}