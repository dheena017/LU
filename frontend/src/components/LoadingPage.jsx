import React from 'react';
import { ClipboardList } from 'lucide-react';

const LoadingPage = ({ message = "Initialising Portal..." }) => {
    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center overflow-hidden relative">
            {/* Animated Background Gradients */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <div className="relative flex flex-col items-center">
                {/* Logo Animation */}
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-red-600 rounded-[30px] blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative bg-[#1E1E1E] p-8 rounded-[35px] border border-white/5 shadow-2xl animate-in zoom-in duration-700">
                        <div className="bg-red-600 p-4 rounded-2xl shadow-xl shadow-red-900/40">
                            <ClipboardList size={40} className="text-white animate-bounce shadow-inner" />
                        </div>
                    </div>
                    {/* Ring animation */}
                    <div className="absolute -inset-4 border-2 border-red-600/20 rounded-[45px] animate-ping opacity-20"></div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-4">
                    <h2 className="text-white text-3xl font-black tracking-tighter uppercase italic">
                        KALVIUM<span className="text-red-600">.</span>
                    </h2>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce"></div>
                        </div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em] animate-pulse">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Progress bar line */}
                <div className="mt-12 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-transparent via-red-600 to-transparent w-1/2 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
};

export default LoadingPage;
