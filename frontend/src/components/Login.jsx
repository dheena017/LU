import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap, Users } from 'lucide-react';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            if (response.data.role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
            <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-3xl border border-white/10 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-block p-4 bg-red-600 rounded-2xl mb-4">
                        <GraduationCap size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Kalvium LU Tracker</h2>
                    <p className="text-gray-400 mt-2">Sign in to your portal</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all"
                            placeholder="e.g. teacher@kalvium.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none text-white transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                    >
                        <LogIn size={20} />
                        Sign In
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div className="p-3 bg-white/5 rounded-xl">
                        <p className="font-bold text-gray-400 mb-1">Teacher Demo:</p>
                        <p>Email: teacher@kalvium.com</p>
                        <p>Pass: pass</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                        <p className="font-bold text-gray-400 mb-1">Student Demo:</p>
                        <p>Email: student1@kalvium.com</p>
                        <p>Pass: pass</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
