import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Profile from './Profile';
import {
    CheckCircle2,
    Clock,
    Circle,
    LogOut,
    TrendingUp,
    ListTodo,
    Calendar,
    MessageSquare,
    Award,
    User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StudentDashboard = ({ user, setUser }) => {
    const [lus, setLus] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyLus();
    }, []);

    const fetchMyLus = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/student/${user.id}/lus`);
            setLus(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (luId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/student/${user.id}/lus/${luId}`, { status });
            toast.success(`Unit marked as ${status}`, {
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            fetchMyLus();
        } catch (err) {
            toast.error('Failed to update status.');
        }
    };

    const stats = {
        total: lus.length,
        completed: lus.filter(l => l.status === 'Completed').length,
        inProgress: lus.filter(l => l.status === 'In Progress').length,
        percentage: lus.length > 0 ? Math.round((lus.filter(l => l.status === 'Completed').length / lus.length) * 100) : 0
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        toast('Logged out safely.', { icon: '👋', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
        navigate('/');
    };

    if (showProfile) {
        return <Profile user={user} setUser={setUser} onBack={() => setShowProfile(false)} />;
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 p-2 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Student Dashboard</h1>
                            <p className="text-gray-400 text-sm">Welcome back, {user.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setShowProfile(true)}
                            className="flex items-center gap-2 hover:text-red-500 transition-colors text-sm font-medium"
                        >
                            <User size={18} /> Profile
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 transition-all">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-white/5 shadow-xl">
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Total Assigned</p>
                        <h2 className="text-4xl font-black">{stats.total}</h2>
                    </div>
                    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-white/5 border-l-4 border-l-red-600 shadow-xl">
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Completion</p>
                        <h2 className="text-4xl font-black text-red-500">{stats.percentage}%</h2>
                    </div>
                    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-white/5 shadow-xl">
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Active Units</p>
                        <h2 className="text-4xl font-black text-yellow-400">{stats.inProgress}</h2>
                    </div>
                </div>

                {/* LU List */}
                <div className="bg-[#1E1E1E] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-6 bg-white/5 border-b border-white/5 flex items-center gap-3">
                        <ListTodo className="text-red-500" />
                        <h3 className="font-bold text-lg">My Curriculum</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {lus.length === 0 ? (
                            <div className="p-20 text-center text-gray-500">No Learning Units assigned yet. Enjoy your break!</div>
                        ) : (
                            lus.map(lu => (
                                <div key={lu.id} className="p-6 hover:bg-white/[0.01] transition-all">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${lu.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                                lu.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5 text-gray-500'
                                                }`}>
                                                {lu.status === 'Completed' ? <CheckCircle2 size={24} /> :
                                                    lu.status === 'In Progress' ? <Clock size={24} /> : <Circle size={24} />}
                                            </div>
                                            <div>
                                                <h4 className={`text-lg font-bold ${lu.status === 'Completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                    {lu.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{lu.module || 'Generic'}</span>
                                                    {lu.dueDate && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500/80 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                                                            <Calendar size={10} /> {new Date(lu.dueDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button onClick={() => updateStatus(lu.id, 'To Do')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${lu.status === 'To Do' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-white'}`}>Reset</button>
                                            <button onClick={() => updateStatus(lu.id, 'In Progress')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${lu.status === 'In Progress' ? 'bg-yellow-500 text-black shadow-lg' : 'text-yellow-500/60 hover:text-yellow-500'}`}>Study</button>
                                            <button onClick={() => updateStatus(lu.id, 'Completed')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${lu.status === 'Completed' ? 'bg-red-600 text-white shadow-lg' : 'text-green-500/60 hover:text-green-500'}`}>Finish</button>
                                        </div>
                                    </div>

                                    {/* Feedback & Grade Section (NEW) */}
                                    {(lu.feedback || lu.grade) && (
                                        <div className="mt-6 p-5 bg-[#121212] rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Award size={80} />
                                            </div>
                                            {lu.grade && (
                                                <div className="flex flex-col items-center justify-center bg-red-600/10 border border-red-600/20 px-6 py-4 rounded-xl min-w-[100px]">
                                                    <span className="text-[10px] uppercase font-black text-red-500 mb-1">Grade</span>
                                                    <span className="text-2xl font-black text-white">{lu.grade}</span>
                                                </div>
                                            )}
                                            {lu.feedback && (
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MessageSquare size={14} className="text-red-500" />
                                                        <span className="text-xs uppercase font-black text-gray-500 tracking-wider">Teacher Feedback</span>
                                                    </div>
                                                    <p className="text-sm text-gray-300 italic leading-relaxed">"{lu.feedback}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
