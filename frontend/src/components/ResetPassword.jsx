import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../lib/config';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const tokenMissing = useMemo(() => !token, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/api/reset-password`, { token, password });
            toast.success('Password reset successful. Please login.', {
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
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
                        <Lock size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                    <p className="text-gray-400 mt-2">Create a new password for your account</p>
                </div>

                {tokenMissing ? (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm text-center">
                        Reset link is missing or invalid. Please request a new one.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-900/20 disabled:opacity-60"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
