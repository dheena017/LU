import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, FileText, Save, ArrowLeft, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = ({ user, setUser, onBack }) => {
    console.log("[DEBUG] Profile rendering with user:", user);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || ''
    });
    const [loading, setLoading] = useState(false);

    if (!user) return <div className="p-20 text-center text-gray-500">Loading profile...</div>;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/profile/${user.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            toast.success('Profile updated successfully!');
        } catch {
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-bold"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="bg-[#1E1E1E] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="h-24 bg-red-600/20 border-b border-white/5 flex items-end p-8">
                    <div className="bg-red-600 p-3 rounded-2xl shadow-xl shadow-red-900/20 translate-y-12 border-4 border-[#1E1E1E]">
                        <User size={32} className="text-white" />
                    </div>
                </div>

                <div className="p-10 pt-16">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black tracking-tight">{user.name}</h2>
                        <p className="text-red-500 text-[10px] uppercase font-black tracking-[0.2em] mt-1">
                            {user.role === 'teacher' ? 'Premium Educator' : 'Verified Learner'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 focus:border-red-600 outline-none transition-all font-bold"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 focus:border-red-600 outline-none transition-all font-bold opacity-50 cursor-not-allowed"
                                    value={formData.email}
                                    disabled
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Personal Description (Bio)</label>
                            <textarea
                                rows="4"
                                className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 focus:border-red-600 outline-none transition-all resize-none font-medium text-gray-300"
                                placeholder="Tell us about yourself..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-red-900/30 uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
