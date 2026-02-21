import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        batch: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/register', formData);
            toast.success('Account created successfully! Please login.', {
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            toast.error('Registration failed.');
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
                        <UserPlus size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Join Kalvium</h2>
                    <p className="text-gray-400 mt-2">Create your learning account</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all"
                            placeholder="e.g. john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">I am a...</label>
                            <select
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all appearance-none cursor-pointer"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">My Batch</label>
                            <select
                                required
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all"
                                value={formData.batch}
                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                            >
                                <option value="" disabled>Select a Batch</option>
                                <option value="Web Dev 2024">Web Dev 2024</option>
                                <option value="AI/ML 2024">AI/ML 2024</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 mt-4"
                    >
                        <UserPlus size={20} />
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
