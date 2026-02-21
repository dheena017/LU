import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CheckCircle2,
    Clock,
    Circle,
    LogOut,
    TrendingUp,
    ListTodo
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = ({ user, setUser }) => {
    const [lus, setLus] = useState([]);
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
            fetchMyLus();
        } catch (err) {
            console.error(err);
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
        navigate('/');
    };

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
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-white/5">
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Total Assigned</p>
                        <h2 className="text-4xl font-black">{stats.total}</h2>
                    </div>
                    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-white/5 border-l-4 border-l-red-600">
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Completion</p>
                        <h2 className="text-4xl font-black text-red-500">{stats.percentage}%</h2>
                    </div>
                    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-white/5">
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Learning Active</p>
                        <h2 className="text-4xl font-black text-yellow-400">{stats.inProgress}</h2>
                    </div>
                </div>

                {/* LU List */}
                <div className="bg-[#1E1E1E] rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-6 bg-white/5 border-b border-white/5 flex items-center gap-3">
                        <ListTodo className="text-red-500" />
                        <h3 className="font-bold text-lg">My Learning Units</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {lus.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">No LUs assigned yet.</div>
                        ) : (
                            lus.map(lu => (
                                <div key={lu.id} className="p-6 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${lu.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                            lu.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5 text-gray-500'
                                            }`}>
                                            {lu.status === 'Completed' ? <CheckCircle2 size={24} /> :
                                                lu.status === 'In Progress' ? <Clock size={24} /> : <Circle size={24} />}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${lu.status === 'Completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                {lu.title}
                                            </h4>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-tighter font-black">{lu.module || 'Generic'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateStatus(lu.id, 'To Do')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lu.status === 'To Do' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => updateStatus(lu.id, 'In Progress')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lu.status === 'In Progress' ? 'bg-yellow-500 text-black' : 'text-yellow-500/50 hover:text-yellow-500'}`}
                                        >
                                            Analyze
                                        </button>
                                        <button
                                            onClick={() => updateStatus(lu.id, 'Completed')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lu.status === 'Completed' ? 'bg-green-600 text-white' : 'text-green-500/50 hover:text-green-500'}`}
                                        >
                                            Finish
                                        </button>
                                    </div>
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
