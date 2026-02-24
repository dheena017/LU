import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../lib/config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/forgot-password`, { email });
            toast.success('If this email exists, a reset link will be sent.', {
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset link.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
            <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-3xl border border-white/10 shadow-2xl">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-sm"
                >
                    <ArrowLeft size={16} /> Back to Login
                </button>

                <div className="text-center mb-10">
                    <div className="inline-block p-4 bg-red-600 rounded-2xl mb-4">
                        <Mail size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
                    <p className="text-gray-400 mt-2">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all"
                            placeholder="e.g. user@kalvium.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-900/20"
                    >
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
