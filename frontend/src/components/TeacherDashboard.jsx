import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    PlusCircle,
    CheckCircle2,
    Clock,
    LogOut,
    LayoutDashboard,
    ClipboardList,
    Search,
    MessageSquare,
    GraduationCap,
    Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const TeacherDashboard = ({ user, setUser }) => {
    const [students, setStudents] = useState([]);
    const [lus, setLus] = useState([]);
    const [newLu, setNewLu] = useState({ title: '', module: '', dueDate: '', assignedTo: [] });
    const [studentSearch, setStudentSearch] = useState('');
    const [gradingTarget, setGradingTarget] = useState(null); // { studentId, luId, studentName, luTitle }
    const [feedbackData, setFeedbackData] = useState({ feedback: '', grade: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsRes, lusRes] = await Promise.all([
                axios.get('http://localhost:5000/api/teacher/students'),
                axios.get('http://localhost:5000/api/lus')
            ]);
            setStudents(studentsRes.data);
            setLus(lusRes.data);
        } catch (err) {
            toast.error("Failed to load dashboard data");
        }
    };

    const handleAddLu = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/lus', newLu);
            setNewLu({ title: '', module: '', dueDate: '', assignedTo: [] });
            toast.success('Learning Unit Assigned Successfully!', {
                icon: '🚀',
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            fetchData();
        } catch (err) {
            toast.error('Failed to create LU.');
        }
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/teacher/grade/${gradingTarget.studentId}/${gradingTarget.luId}`, feedbackData);
            toast.success(`Feedback sent to ${gradingTarget.studentName}!`);
            setGradingTarget(null);
            setFeedbackData({ feedback: '', grade: '' });
            fetchData();
        } catch (err) {
            toast.error("Failed to submit grade");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        toast('Logged out safely.', { icon: '👋', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
        navigate('/');
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const getAggregateStats = () => {
        let completed = 0, inProgress = 0, todo = 0;
        students.forEach(s => {
            const studentLUs = lus.filter(lu => lu.assignedTo.includes(s.id));
            studentLUs.forEach(lu => {
                const prog = s.progress && s.progress[lu.id];
                const status = (typeof prog === 'string' ? prog : prog?.status) || 'To Do';
                if (status === 'Completed') completed++;
                else if (status === 'In Progress') inProgress++;
                else todo++;
            });
        });
        return [
            { name: 'Completed', value: completed, color: '#DC2626' },
            { name: 'In Progress', value: inProgress, color: '#FACC15' },
            { name: 'To Do', value: todo, color: '#4B5563' }
        ];
    };

    const chartData = getAggregateStats();

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
                            <p className="text-gray-400 text-sm">Welcome back, {user.name}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 transition-all">
                        <LogOut size={18} /> Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Progress Chart */}
                    <div className="lg:col-span-3 bg-[#1E1E1E] p-8 rounded-3xl border border-white/5 shadow-xl flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/3">
                            <h3 className="text-xl font-bold mb-2">Class Performance</h3>
                            <p className="text-gray-400 text-sm mb-6">Aggregate view of student completion.</p>
                            <div className="space-y-4">
                                {chartData.map(item => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm text-gray-300">{item.name}</span>
                                        </div>
                                        <span className="font-bold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-2/3 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: 'none', borderRadius: '10px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Left: Search & Student List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-[#1E1E1E] rounded-3xl border border-white/5 overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-white/5 gap-4">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
                                    <LayoutDashboard size={20} /> Student Progress
                                </h3>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-red-500 outline-none"
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-4 font-bold">Student</th>
                                            <th className="px-6 py-4 font-bold">LUs Assigned</th>
                                            <th className="px-6 py-4 font-bold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredStudents.map(s => {
                                            const studentLUs = lus.filter(lu => lu.assignedTo.includes(s.id));
                                            return (
                                                <React.Fragment key={s.id}>
                                                    <tr className="hover:bg-white/[0.02]">
                                                        <td className="px-6 py-5">
                                                            <p className="font-bold">{s.name}</p>
                                                            <p className="text-xs text-gray-500">{s.email}</p>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="text-sm font-bold text-red-500">{studentLUs.length} Assigned</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <button
                                                                onClick={() => {
                                                                    const row = document.getElementById(`details-${s.id}`);
                                                                    row.classList.toggle('hidden');
                                                                }}
                                                                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
                                                            >
                                                                View LUs
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    <tr id={`details-${s.id}`} className="hidden bg-[#121212]/50">
                                                        <td colSpan="3" className="px-6 py-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {studentLUs.map(lu => {
                                                                    const prog = s.progress && s.progress[lu.id];
                                                                    const status = (typeof prog === 'string' ? prog : prog?.status) || 'To Do';
                                                                    return (
                                                                        <div key={lu.id} className="bg-[#1E1E1E] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                                                            <div>
                                                                                <p className="font-bold text-sm">{lu.title}</p>
                                                                                <p className={`text-[10px] font-bold uppercase ${status === 'Completed' ? 'text-green-500' :
                                                                                        status === 'In Progress' ? 'text-yellow-400' : 'text-gray-500'
                                                                                    }`}>{status}</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => setGradingTarget({ studentId: s.id, luId: lu.id, studentName: s.name, luTitle: lu.title })}
                                                                                className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                                            >
                                                                                <MessageSquare size={16} />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: Assign New LU */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/5 shadow-xl sticky top-10">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <PlusCircle className="text-red-500" /> Assign New LU
                            </h3>
                            <form onSubmit={handleAddLu} className="space-y-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">LU Title</label>
                                    <input type="text" className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none" value={newLu.title} onChange={(e) => setNewLu({ ...newLu, title: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Module</label>
                                        <input type="text" className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none" value={newLu.module} onChange={(e) => setNewLu({ ...newLu, module: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                                        <input type="date" className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none text-sm" value={newLu.dueDate} onChange={(e) => setNewLu({ ...newLu, dueDate: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Assign to Students</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {students.map(s => (
                                            <label key={s.id} className="flex items-center gap-3 p-3 bg-[#121212] rounded-xl border border-white/5 cursor-pointer hover:border-red-500/30">
                                                <input type="checkbox" className="w-4 h-4 accent-red-600" checked={newLu.assignedTo.includes(s.id)} onChange={(e) => {
                                                    const updated = e.target.checked ? [...newLu.assignedTo, s.id] : newLu.assignedTo.filter(id => id !== s.id);
                                                    setNewLu({ ...newLu, assignedTo: updated });
                                                }} />
                                                <span className="text-sm">{s.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/10">Assign Now</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grading Modal */}
            {gradingTarget && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1E1E1E] w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setGradingTarget(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white">&times;</button>
                        <h3 className="text-2xl font-bold mb-2">Give Feedback</h3>
                        <p className="text-gray-400 mb-6 text-sm">Grading <span className="text-red-500 font-bold">{gradingTarget.luTitle}</span> for <span className="text-white font-bold">{gradingTarget.studentName}</span></p>

                        <form onSubmit={handleGradeSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Grade / Score</label>
                                <input
                                    type="text"
                                    placeholder="e.g. A+, 95/100, Completed"
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none"
                                    value={feedbackData.grade}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, grade: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Comments (Optional)</label>
                                <textarea
                                    rows="4"
                                    placeholder="Provide detailed feedback..."
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none resize-none"
                                    value={feedbackData.feedback}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg ring-4 ring-red-600/10">Submit Feedback</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default TeacherDashboard;
