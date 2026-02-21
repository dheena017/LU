import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    PlusCircle,
    CheckCircle2,
    Clock,
    LogOut,
    LayoutDashboard,
    ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TeacherDashboard = ({ user, setUser }) => {
    const [students, setStudents] = useState([]);
    const [lus, setLus] = useState([]);
    const [newLu, setNewLu] = useState({ title: '', module: '', assignedTo: [] });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [studentsRes, lusRes] = await Promise.all([
            axios.get('http://localhost:5000/api/teacher/students'),
            axios.get('http://localhost:5000/api/lus')
        ]);
        setStudents(studentsRes.data);
        setLus(lusRes.data);
    };

    const handleAddLu = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/lus', newLu);
            setNewLu({ title: '', module: '', assignedTo: [] });
            toast.success('Learning Unit Assigned Successfully!', {
                icon: '🚀',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error('Failed to create LU.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        toast('Logged out safely.', {
            icon: '👋',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 p-2 rounded-xl">
                            <Users size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Teacher Portal</h1>
                            <p className="text-gray-400 text-sm">Welcome, {user.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create LU Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/5 shadow-xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <PlusCircle className="text-red-500" />
                                Assign New LU
                            </h3>
                            <form onSubmit={handleAddLu} className="space-y-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">LU Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none"
                                        value={newLu.title}
                                        onChange={(e) => setNewLu({ ...newLu, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Module</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none"
                                        value={newLu.module}
                                        onChange={(e) => setNewLu({ ...newLu, module: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Assign to Students</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {students.map(s => (
                                            <label key={s.id} className="flex items-center gap-3 p-3 bg-[#121212] rounded-xl border border-white/5 cursor-pointer hover:border-red-500/30">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-red-600"
                                                    checked={newLu.assignedTo.includes(s.id)}
                                                    onChange={(e) => {
                                                        const updated = e.target.checked
                                                            ? [...newLu.assignedTo, s.id]
                                                            : newLu.assignedTo.filter(id => id !== s.id);
                                                        setNewLu({ ...newLu, assignedTo: updated });
                                                    }}
                                                />
                                                <span className="text-sm">{s.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/10"
                                >
                                    Create & Assign
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Progress Tracker Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#1E1E1E] rounded-3xl border border-white/5 overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/5">
                                <LayoutDashboard className="text-red-500" />
                                <h3 className="text-xl font-bold">Student Progress Tracker</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-4 font-bold">Student Name</th>
                                            <th className="px-6 py-4 font-bold">Completion Status</th>
                                            <th className="px-6 py-4 font-bold">LUs Finished</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {students.map(s => {
                                            const totalLUs = lus.filter(lu => lu.assignedTo.includes(s.id)).length;
                                            const completedLUs = Object.values(s.progress || {}).filter(status => status === 'Completed').length;
                                            const percent = totalLUs > 0 ? Math.round((completedLUs / totalLUs) * 100) : 0;

                                            return (
                                                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-5 font-medium">{s.name}</td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                                                <div
                                                                    className="bg-red-600 h-full transition-all duration-500"
                                                                    style={{ width: `${percent}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-bold min-w-[3rem]">{percent}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-gray-300">
                                                        {completedLUs} / {totalLUs}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
