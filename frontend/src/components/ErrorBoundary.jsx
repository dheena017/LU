import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CRITICAL UI ERROR CAUGHT:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full bg-[#1E1E1E] p-10 rounded-[40px] border border-red-500/30 shadow-2xl shadow-red-900/20">
                        <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Interface Halted</h1>
                        <p className="text-gray-400 mb-8 font-medium">
                            We caught a rendering error to prevent a total crash. This usually happens due to a data mismatch or syntax glitch.
                        </p>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm shadow-xl shadow-red-900/10"
                        >
                            Reset Session & Recover
                        </button>
                        <p className="mt-6 text-[10px] text-gray-600 font-mono break-all opacity-50">
                            {this.state.error?.toString()}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
