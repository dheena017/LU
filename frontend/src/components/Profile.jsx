import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, FileText, Save, ArrowLeft, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = ({ user, setUser, onBack }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        bio: user.bio || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put(`http://localhost:5000/api/profile/${user.id}`, formData);
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10 font-sans">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="bg-[#1E1E1E] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="h-32 bg-red-600 relative">
                        <div className="absolute -bottom-12 left-8 p-1 bg-[#1E1E1E] rounded-full">
                            <div className="w-24 h-24 bg-[#121212] rounded-full flex items-center justify-center text-red-600 border-4 border-[#1E1E1E]">
                                <User size={48} />
                                <button className="absolute bottom-0 right-0 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg">
                                    <Camera size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 p-8">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold">{user.name}</h2>
                            <p className="text-gray-400 font-medium uppercase text-xs tracking-widest mt-1">
                                {user.role === 'teacher' ? 'Premium Educator' : 'Learning Unit Student'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                        <User size={14} className="text-red-500" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                        <Mail size={14} className="text-red-500" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                    <FileText size={14} className="text-red-500" /> Professional Bio
                                </label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-all resize-none"
                                    placeholder="Tell us about yourself..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={20} />
                                {loading ? 'Saving Changes...' : 'Save Profile Details'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-gray-300">Account Security</h4>
                        <p className="text-xs text-gray-500">Your password is currently secured with our system.</p>
                    </div>
                    <button className="text-xs font-bold text-red-500 hover:underline">Change Password</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
