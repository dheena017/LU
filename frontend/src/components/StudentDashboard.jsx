import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    User,
    Bell,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Profile from './Profile';

const StudentDashboard = ({ user, setUser }) => {
    const [lus, setLus] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
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

    return (
        <div className="flex min-h-screen bg-[#121212] text-white font-sans">
            <Sidebar
                role="student"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                handleLogout={handleLogout}
            />

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight capitalize">
                            {activeTab.replace(/([A-Z])/g, ' $1')}
                        </h2>
                        <p className="text-gray-500 text-sm">Learning Progress for {user.name}.</p>
                    </div>
                    <div className="bg-[#1E1E1E] p-2 rounded-xl border border-white/5 text-gray-400 hover:text-red-500 cursor-pointer transition-all">
                        <Bell size={20} />
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#1E1E1E] p-8 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group">
                                <TrendingUp className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 group-hover:text-red-600/10 transition-colors" />
                                <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] mb-3">Goal Attendance</p>
                                <h2 className="text-5xl font-black tracking-tighter">{stats.total}</h2>
                                <p className="text-sm text-gray-400 mt-2">Assigned Units</p>
                            </div>
                            <div className="bg-[#1E1E1E] p-8 rounded-[32px] border border-white/5 border-l-4 border-l-red-600 shadow-xl relative overflow-hidden group">
                                <Award className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 group-hover:text-red-600/10 transition-colors" />
                                <p className="text-red-500 text-[10px] uppercase font-black tracking-[0.2em] mb-3">Mastery Level</p>
                                <h2 className="text-5xl font-black tracking-tighter">{stats.percentage}%</h2>
                                <p className="text-sm text-gray-400 mt-2">Overall Progress</p>
                            </div>
                            <div className="bg-[#1E1E1E] p-8 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group">
                                <Clock className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 group-hover:text-yellow-600/10 transition-colors" />
                                <p className="text-yellow-500 text-[10px] uppercase font-black tracking-[0.2em] mb-3">In Development</p>
                                <h2 className="text-5xl font-black tracking-tighter">{stats.inProgress}</h2>
                                <p className="text-sm text-gray-400 mt-2">Active Learning</p>
                            </div>
                        </div>

                        {/* Recent Activity / Next Step */}
                        <div className="bg-gradient-to-br from-red-600/10 to-[#1E1E1E] p-10 rounded-[40px] border border-red-600/10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight mb-2 italic uppercase">Next Milestone</h3>
                                <p className="text-gray-400 max-w-md leading-relaxed">
                                    Continue your streak! You have {stats.total - stats.completed} units remaining to complete this module.
                                    Regular updates help your teacher track your growth.
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveTab('curriculum')}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-2xl shadow-red-900/40 flex items-center gap-3 transition-all active:scale-95"
                            >
                                Open Curriculum <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <div className="bg-[#1E1E1E] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 bg-white/5 border-b border-white/5 flex items-center gap-3">
                            <ListTodo className="text-red-500" />
                            <h3 className="font-black text-xl italic uppercase font-black">Learning Roadmap</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {lus.length === 0 ? (
                                <div className="p-32 text-center">
                                    <div className="bg-[#121212] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                        <Award className="text-gray-600" size={32} />
                                    </div>
                                    <p className="text-gray-500 font-bold">Your curriculum is clear! No units assigned.</p>
                                </div>
                            ) : (
                                lus.map(lu => (
                                    <div key={lu.id} className="p-8 hover:bg-white/[0.01] transition-all group">
                                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className={`p-5 rounded-[22px] transition-all duration-300 ${lu.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                                        lu.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'bg-[#121212] text-gray-700'
                                                    }`}>
                                                    {lu.status === 'Completed' ? <CheckCircle2 size={28} /> :
                                                        lu.status === 'In Progress' ? <Clock size={28} /> : <Circle size={28} />}
                                                </div>
                                                <div>
                                                    <h4 className={`text-xl font-black tracking-tight ${lu.status === 'Completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                        {lu.title}
                                                    </h4>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">{lu.module || 'General'}</span>
                                                        {lu.dueDate && (
                                                            <span className="flex items-center gap-2 text-[10px] font-black text-red-500/80 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10">
                                                                <Calendar size={12} /> {new Date(lu.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 w-full xl:w-auto bg-[#121212] p-1.5 rounded-[24px]">
                                                <button onClick={() => updateStatus(lu.id, 'To Do')} className={`flex-1 xl:flex-none px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${lu.status === 'To Do' ? 'bg-[#1E1E1E] text-white shadow-xl' : 'text-gray-600 hover:text-white'}`}>Reset</button>
                                                <button onClick={() => updateStatus(lu.id, 'In Progress')} className={`flex-1 xl:flex-none px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${lu.status === 'In Progress' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20' : 'text-yellow-600 hover:text-yellow-500'}`}>Study</button>
                                                <button onClick={() => updateStatus(lu.id, 'Completed')} className={`flex-1 xl:flex-none px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${lu.status === 'Completed' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-green-600 hover:text-green-500'}`}>Finish</button>
                                            </div>
                                        </div>

                                        {(lu.feedback || lu.grade) && (
                                            <div className="mt-8 p-6 bg-[#121212] rounded-[28px] border border-white/5 flex flex-col md:flex-row gap-8 relative overflow-hidden group/feedback">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/feedback:opacity-10 transition-opacity">
                                                    <Award size={100} />
                                                </div>
                                                {lu.grade && (
                                                    <div className="flex flex-col items-center justify-center bg-red-600/10 border border-red-600/20 px-8 py-6 rounded-[22px] min-w-[120px] shadow-2xl">
                                                        <span className="text-[10px] uppercase font-black text-red-500 mb-2 tracking-widest">Mark Recieved</span>
                                                        <span className="text-3xl font-black text-white">{lu.grade}</span>
                                                    </div>
                                                )}
                                                {lu.feedback && (
                                                    <div className="flex-1 py-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <MessageSquare size={16} className="text-red-500" />
                                                            <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Instructor Review</span>
                                                        </div>
                                                        <p className="text-base text-gray-400 italic leading-relaxed font-medium">"{lu.feedback}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Profile user={user} setUser={setUser} onBack={() => setActiveTab('dashboard')} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
