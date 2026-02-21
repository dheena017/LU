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
    ChevronRight,
    PlusCircle,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Profile from './Profile';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const calculateStreaks = (activityArray = []) => {
    if (activityArray.length === 0) return { current: 0, best: 0, total: 0 };

    // Get unique dates and sort them descending
    const sortedDates = [...new Set(activityArray)].sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    let bestStreak = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const latestDateStr = sortedDates[0];

    // Check if the streak is active (today or yesterday)
    const isActive = latestDateStr === todayStr || latestDateStr === yesterdayStr;

    if (isActive) {
        currentStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const current = new Date(sortedDates[i]);
            const next = new Date(sortedDates[i + 1]);
            const diffTime = Math.abs(current - next);
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Best Streak Calculation
    let tempStreak = 1;
    bestStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = new Date(sortedDates[i]);
        const next = new Date(sortedDates[i + 1]);
        const diffTime = Math.abs(current - next);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            tempStreak++;
        } else {
            tempStreak = 1;
        }
        if (tempStreak > bestStreak) bestStreak = tempStreak;
    }

    return { current: currentStreak, best: bestStreak, total: activityArray.length };
};

const StudentDashboard = ({ user, setUser }) => {
    const [lus, setLus] = useState([]);
    const [userData, setUserData] = useState(user);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [filterTag, setFilterTag] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyLus();

        // Real-time listener
        socket.on('data_updated', (data) => {
            fetchMyLus();
            if (data.type === 'new_lu') {
                toast(`New LU Assigned: ${data.title}`, {
                    icon: '🎁',
                    style: { borderRadius: '10px', background: '#333', color: '#fff' }
                });
            } else if (data.type === 'grade_updated' && data.userId === user.id) {
                toast('Teacher provided feedback on your work!', {
                    icon: '📝',
                    style: { borderRadius: '10px', background: '#333', color: '#fff' }
                });
            }
        });

        return () => {
            socket.off('data_updated');
        };
    }, []);

    const fetchMyLus = async () => {
        try {
            const [lusRes, userRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/student/${user.id}/lus`),
                axios.get(`http://localhost:5000/api/profile/${user.id}`) // We can use the profile endpoint to get latest user data
            ]);
            setLus(lusRes.data);
            setUserData(userRes.data);
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

    const streaks = calculateStreaks(userData.learningActivity || []);

    const stats = {
        total: lus.length,
        completed: lus.filter(l => l.status === 'Completed').length,
        inProgress: lus.filter(l => l.status === 'In Progress').length,
        percentage: lus.length > 0 ? Math.round((lus.filter(l => l.status === 'Completed').length / lus.length) * 100) : 0,
        currentStreak: streaks.current,
        bestStreak: streaks.best,
        totalInteractions: streaks.total
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
                            <div className="bg-[#1E1E1E] p-8 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group flex items-center justify-between">
                                <div className="z-10">
                                    <p className="text-red-500 text-[10px] uppercase font-black tracking-[0.2em] mb-3">Mastery Level</p>
                                    <h2 className="text-5xl font-black tracking-tighter">{stats.percentage}%</h2>
                                    <p className="text-sm text-gray-400 mt-2">Overall Progress</p>
                                </div>
                                <div className="relative w-24 h-24">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-white/5"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 - (251.2 * stats.percentage) / 100}
                                            strokeLinecap="round"
                                            className="text-red-600 transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <Award className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20" size={20} />
                                </div>
                            </div>
                            <div className="bg-[#1E1E1E] p-8 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group">
                                <Clock className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 group-hover:text-yellow-600/10 transition-colors" />
                                <p className="text-yellow-500 text-[10px] uppercase font-black tracking-[0.2em] mb-3">In Development</p>
                                <h2 className="text-5xl font-black tracking-tighter">{stats.inProgress}</h2>
                                <p className="text-sm text-gray-400 mt-2">Active Learning</p>
                            </div>
                        </div>

                        {/* Recent Activity / Next Step */}
                        {/* Activity Heatmap */}
                        <div className="bg-[#1E1E1E] p-10 rounded-[40px] border border-white/5 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight uppercase italic mb-1">Learning Consistency</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Activity heatmap for the last 15 weeks</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                                    <span>Less</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 bg-white/5 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-red-900/30 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-red-800/50 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-red-700/70 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                                    </div>
                                    <span>More</span>
                                </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                                {[...Array(15)].map((_, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-2">
                                        {[...Array(7)].map((_, dayIndex) => {
                                            // Real Activity Logic
                                            const day = new Date();
                                            day.setUTCDate(day.getUTCDate() - (14 - weekIndex) * 7 - (6 - dayIndex));
                                            const dateString = day.toISOString().split('T')[0];

                                            const activityCount = (userData.learningActivity || []).filter(d => d === dateString).length;
                                            const intensity = activityCount > 4 ? 4 : activityCount;

                                            const colors = [
                                                'bg-white/5',
                                                'bg-red-900/30',
                                                'bg-red-800/50',
                                                'bg-red-700/70',
                                                'bg-red-600'
                                            ];
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className={`w-4 h-4 rounded-[4px] transition-all hover:scale-125 cursor-help ${colors[intensity]}`}
                                                    title={`${dateString}: ${activityCount} interactions`}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex items-center gap-6 border-t border-white/5 pt-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-red-600/10 rounded-lg text-red-500"><TrendingUp size={16} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Daily Streak</p>
                                        <p className="text-sm font-bold">{stats.currentStreak} Days</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 border-l border-white/5 pl-6">
                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><PlusCircle size={16} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Learning Energy</p>
                                        <p className="text-sm font-bold">{stats.totalInteractions} XP</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 border-l border-white/5 pl-6">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Award size={16} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Best Streak</p>
                                        <p className="text-sm font-bold">{stats.bestStreak} Days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <div className="bg-[#1E1E1E] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 bg-white/5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <ListTodo className="text-red-500" />
                                <h3 className="font-black text-xl italic uppercase font-black">Learning Roadmap</h3>
                            </div>

                            {/* Tag Filter */}
                            <div className="flex items-center gap-3 bg-[#121212] p-1.5 rounded-2xl border border-white/5">
                                <Filter size={14} className="ml-3 text-gray-500" />
                                <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[300px]">
                                    {['All', ...new Set(lus.flatMap(lu => lu.tags || []))].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setFilterTag(tag)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterTag === tag ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {lus.filter(lu => filterTag === 'All' || (lu.tags && lu.tags.includes(filterTag))).length === 0 ? (
                                <div className="p-32 text-center">
                                    <div className="bg-[#121212] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                        <Award className="text-gray-600" size={32} />
                                    </div>
                                    <p className="text-gray-500 font-bold">No units found matching this criteria.</p>
                                </div>
                            ) : (
                                lus.filter(lu => filterTag === 'All' || (lu.tags && lu.tags.includes(filterTag))).map(lu => (
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
                                                        {lu.tags && lu.tags.length > 0 && (
                                                            <div className="flex gap-2">
                                                                {lu.tags.map(tag => (
                                                                    <span key={tag} className="text-[10px] font-bold text-red-500/60 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 hover:border-red-500 transition-colors">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
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

                {activeTab === 'calendar' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#1E1E1E] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
                            <div className="p-10 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Deadline Tracker</h3>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">Monthly View & Milestones</p>
                                </div>
                                <div className="flex items-center gap-4 bg-[#121212] p-2 rounded-2xl border border-white/5">
                                    <div className="px-6 py-2 bg-red-600 rounded-xl text-white font-black text-sm shadow-lg shadow-red-900/20">
                                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-10">
                                <div className="grid grid-cols-7 gap-6 text-center mb-6">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {(() => {
                                        const now = new Date();
                                        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
                                        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                                        const days = [];

                                        for (let i = 0; i < firstDayOfMonth; i++) {
                                            days.push(<div key={`empty-${i}`} className="aspect-square bg-white/[0.01] rounded-[24px]"></div>);
                                        }

                                        for (let d = 1; d <= daysInMonth; d++) {
                                            const date = new Date(now.getFullYear(), now.getMonth(), d);
                                            const dateStr = date.toISOString().split('T')[0];
                                            const dayLus = lus.filter(lu => lu.dueDate && lu.dueDate.split('T')[0] === dateStr);
                                            const isToday = d === now.getDate();

                                            days.push(
                                                <div key={d} className={`aspect-square p-4 rounded-[28px] border transition-all hover:border-red-600/50 group relative ${isToday ? 'bg-red-600 shadow-2xl shadow-red-900/40 border-transparent' : 'bg-[#121212] border-white/5'
                                                    }`}>
                                                    <span className={`text-xl font-black tracking-tighter ${isToday ? 'text-white' : 'text-gray-600'}`}>
                                                        {d}
                                                    </span>

                                                    <div className="mt-2 flex flex-col gap-1">
                                                        {dayLus.map(lu => (
                                                            <div key={lu.id} className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg truncate ${lu.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-100'
                                                                }`}>
                                                                {lu.title}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {dayLus.length > 0 && !isToday && (
                                                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return days;
                                    })()}
                                </div>
                            </div>

                            <div className="p-10 bg-white/[0.02] border-t border-white/5">
                                <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6 px-2">Next Targets</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {lus.filter(lu => lu.dueDate && new Date(lu.dueDate) >= new Date())
                                        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                                        .slice(0, 3)
                                        .map(lu => (
                                            <div key={lu.id} className="bg-[#121212] p-6 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-red-600/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-red-600/10 rounded-2xl text-red-500">
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-black text-sm tracking-tight truncate max-w-[120px]">{lu.title}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(lu.dueDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="text-white/10 group-hover:text-red-500 transition-colors" size={16} />
                                            </div>
                                        ))}
                                </div>
                            </div>
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
