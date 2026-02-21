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
    Calendar,
    ArrowUpDown,
    User,
    Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';
import Sidebar from './Sidebar';
import Profile from './Profile';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const TeacherDashboard = ({ user, setUser }) => {
    const [students, setStudents] = useState([]);
    const [lus, setLus] = useState([]);
    const [newLu, setNewLu] = useState({ title: '', module: '', dueDate: '', assignedTo: [] });
    const [studentSearch, setStudentSearch] = useState('');
    const [gradingTarget, setGradingTarget] = useState(null);
    const [feedbackData, setFeedbackData] = useState({ feedback: '', grade: '' });
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedBatch, setSelectedBatch] = useState('All Classes');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();

        // Listen for real-time updates
        socket.on('data_updated', (data) => {
            fetchData();
            if (data.type === 'status_updated') {
                toast('Student updated progress!', {
                    icon: '🔔',
                    style: { borderRadius: '10px', background: '#333', color: '#fff' }
                });
            }
        });

        return () => {
            socket.off('data_updated');
        };
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
            setActiveTab('students'); // Switch to students view to see progress
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

    const batches = ['All Classes', ...new Set(students.map(s => s.batch).filter(Boolean))];

    const filteredStudentsByBatch = selectedBatch === 'All Classes'
        ? students
        : students.filter(s => s.batch === selectedBatch);

    const sortedStudents = [...filteredStudentsByBatch]
        .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
        .sort((a, b) => {
            let valA, valB;
            if (sortBy === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else if (sortBy === 'assigned') {
                valA = lus.filter(lu => lu.assignedTo.includes(a.id)).length;
                valB = lus.filter(lu => lu.assignedTo.includes(b.id)).length;
            } else if (sortBy === 'completion') {
                const totalA = lus.filter(lu => lu.assignedTo.includes(a.id)).length;
                const doneA = Object.values(a.progress || {}).filter(p => (typeof p === 'string' ? p : p.status) === 'Completed').length;
                valA = totalA > 0 ? (doneA / totalA) : 0;
                const totalB = lus.filter(lu => lu.assignedTo.includes(b.id)).length;
                const doneB = Object.values(b.progress || {}).filter(p => (typeof p === 'string' ? p : p.status) === 'Completed').length;
                valB = totalB > 0 ? (doneB / totalB) : 0;
            }
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    const toggleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    };

    const getAggregateStats = () => {
        let completed = 0, inProgress = 0, todo = 0;
        filteredStudentsByBatch.forEach(s => {
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

    const barChartData = [
        {
            name: 'Completed',
            students: chartData.find(d => d.name === 'Completed')?.value || 0,
            fill: '#DC2626'
        },
        {
            name: 'Pending',
            students: (chartData.find(d => d.name === 'In Progress')?.value || 0) + (chartData.find(d => d.name === 'To Do')?.value || 0),
            fill: '#4B5563'
        }
    ];

    return (
        <div className="flex min-h-screen bg-[#121212] text-white font-sans">
            <Sidebar
                role="teacher"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                handleLogout={handleLogout}
            />

            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header with Search (Universal) */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight capitalize">
                            {activeTab.replace(/([A-Z])/g, ' $1')}
                        </h2>
                        <p className="text-gray-500 text-sm">Managing Kalvium LUs for {students.length} students.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="bg-[#1E1E1E] border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-red-500 outline-none cursor-pointer text-gray-300 font-bold"
                        >
                            {batches.map(batch => (
                                <option key={batch} value={batch}>{batch}</option>
                            ))}
                        </select>
                        <div className="bg-[#1E1E1E] p-2 rounded-xl border border-white/5 text-gray-400 hover:text-red-500 cursor-pointer transition-all">
                            <Bell size={20} />
                        </div>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Metrics & Pie Chart */}
                        <div className="bg-[#1E1E1E] p-10 rounded-[32px] border border-white/5 shadow-2xl flex flex-col lg:flex-row items-center gap-12">
                            <div className="w-full lg:w-1/2">
                                <h3 className="text-2xl font-bold mb-4">Class Performance Analysis</h3>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    This chart shows the real-time completion status of all units assigned to your current batch.
                                    Use this to identify if the module is too difficult or if students are falling behind.
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    {chartData.map(item => (
                                        <div key={item.name} className="bg-[#121212] p-4 rounded-2xl border border-white/5">
                                            <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: item.color }}></div>
                                            <p className="text-[10px] uppercase font-black text-gray-500 tracking-tighter">{item.name}</p>
                                            <p className="text-xl font-bold">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full lg:w-1/2 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: 'none', borderRadius: '16px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart: Pending vs Completed */}
                        <div className="bg-[#1E1E1E] p-10 rounded-[32px] border border-white/5 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Class Stage Distribution</h3>
                                <p className="text-gray-400 mb-2 text-sm text-gray-500">Comparison of completed tasks versus total pending workload across the entire class.</p>
                            </div>
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#666"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#666"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 10 }}
                                            contentStyle={{ backgroundColor: '#1E1E1E', border: 'none', borderRadius: '12px', color: '#fff' }}
                                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        />
                                        <Bar
                                            dataKey="students"
                                            radius={[10, 10, 0, 0]}
                                            barSize={60}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-[#1E1E1E] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-white/5 gap-6">
                            <div className="flex gap-2">
                                {['name', 'assigned', 'completion'].map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleSort(key)}
                                        className={`text-[10px] uppercase font-black px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${sortBy === key ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}
                                    >
                                        {key} {sortBy === key && <ArrowUpDown size={10} />}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="w-full bg-[#121212] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-red-500 outline-none transition-all"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                                        <th className="px-8 py-5">Full Name</th>
                                        <th className="px-8 py-5">Class (Batch)</th>
                                        <th className="px-8 py-5">Assigned LUs</th>
                                        <th className="px-8 py-5">Completion</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sortedStudents.map(s => {
                                        const studentLUs = lus.filter(lu => lu.assignedTo.includes(s.id));
                                        const completedLUs = Object.values(s.progress || {}).filter(p => (typeof p === 'string' ? p : p.status) === 'Completed').length;
                                        const percent = studentLUs.length > 0 ? Math.round((completedLUs / studentLUs.length) * 100) : 0;
                                        return (
                                            <React.Fragment key={s.id}>
                                                <tr className="hover:bg-white/[0.02] group transition-all">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600 font-bold border border-red-600/20">
                                                                {s.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold">{s.name}</p>
                                                                <p className="text-xs text-gray-500">{s.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10">
                                                            {s.batch || 'Unassigned'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-sm font-black bg-white/5 px-3 py-1 rounded-lg border border-white/5">{studentLUs.length} Units</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3 min-w-[120px]">
                                                            <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                                                <div className="bg-red-600 h-full rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-black">{percent}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right text-gray-400 group-hover:text-red-500">
                                                        <button
                                                            onClick={() => document.getElementById(`details-${s.id}`).classList.toggle('hidden')}
                                                            className="p-2 hover:bg-white/5 rounded-xl transition-all"
                                                        >
                                                            <ClipboardList size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr id={`details-${s.id}`} className="hidden bg-[#121212]/30">
                                                    <td colSpan="4" className="px-8 py-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {studentLUs.map(lu => {
                                                                const prog = s.progress && s.progress[lu.id];
                                                                const status = (typeof prog === 'string' ? prog : prog?.status) || 'To Do';
                                                                return (
                                                                    <div key={lu.id} className="bg-[#1E1E1E] p-5 rounded-2xl border border-white/5 flex justify-between items-center group/item hover:border-red-500/30 transition-all">
                                                                        <div className="min-w-0">
                                                                            <p className="font-bold text-sm truncate">{lu.title}</p>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'Completed' ? 'bg-green-500' : status === 'In Progress' ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
                                                                                <p className="text-[10px] font-black uppercase tracking-tighter text-gray-500">{status}</p>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => setGradingTarget({ studentId: s.id, luId: lu.id, studentName: s.name, luTitle: lu.title })}
                                                                            className="p-2 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-xl transition-all shadow-lg"
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
                )}

                {activeTab === 'assign' && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#1E1E1E] p-10 rounded-[32px] border border-white/5 shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-red-600/10 text-red-600 rounded-2xl border border-red-600/20">
                                    <PlusCircle size={24} />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase italic">Deploy New Unit</h3>
                            </div>
                            <form onSubmit={handleAddLu} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Core Title</label>
                                    <input type="text" className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 focus:border-red-600 outline-none transition-all font-bold" placeholder="e.g. React State Hooks" value={newLu.title} onChange={(e) => setNewLu({ ...newLu, title: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Module ID</label>
                                        <input type="text" className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 focus:border-red-600 outline-none transition-all" placeholder="MOD-01" value={newLu.module} onChange={(e) => setNewLu({ ...newLu, module: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Hard Deadline</label>
                                        <input type="date" className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 focus:border-red-600 outline-none transition-all text-white" value={newLu.dueDate} onChange={(e) => setNewLu({ ...newLu, dueDate: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-3 flex justify-between items-center">
                                        Select Targets ({newLu.assignedTo.length})
                                        <div className="flex gap-2 text-[10px]">
                                            {batches.map(b => (
                                                <button
                                                    key={b}
                                                    type="button"
                                                    onClick={() => {
                                                        const batchStudents = b === 'All Classes' ? students : students.filter(s => s.batch === b);
                                                        const batchIds = batchStudents.map(s => s.id);
                                                        setNewLu({ ...newLu, assignedTo: [...new Set([...newLu.assignedTo, ...batchIds])] });
                                                    }}
                                                    className="px-2 py-1 bg-white/5 hover:bg-red-600 rounded-md transition-all"
                                                >
                                                    Add {b === 'All Classes' ? 'All' : b}
                                                </button>
                                            ))}
                                        </div>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar p-1">
                                        {students.map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    const updated = newLu.assignedTo.includes(s.id)
                                                        ? newLu.assignedTo.filter(id => id !== s.id)
                                                        : [...newLu.assignedTo, s.id];
                                                    setNewLu({ ...newLu, assignedTo: updated });
                                                }}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${newLu.assignedTo.includes(s.id) ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-[#121212] border-white/10 text-gray-400 hover:border-red-600/30'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center ${newLu.assignedTo.includes(s.id) ? 'bg-white border-white' : 'border-white/20'}`}>
                                                    {newLu.assignedTo.includes(s.id) && <CheckCircle2 size={12} className="text-red-600" />}
                                                </div>
                                                <span className="text-xs font-bold truncate">{s.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-red-900/30 uppercase tracking-widest active:scale-95">Assign to Batch</button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Profile user={user} setUser={setUser} onBack={() => setActiveTab('overview')} />
                    </div>
                )}
            </main>

            {/* Grading Modal */}
            {gradingTarget && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-[#1E1E1E] w-full max-w-lg p-10 rounded-[40px] border border-white/10 shadow-2xl relative">
                        <button onClick={() => setGradingTarget(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white text-3xl font-light">&times;</button>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-600 rounded-2xl text-white">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic">Assessor Feedback</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Grading {gradingTarget.studentName}</p>
                            </div>
                        </div>

                        <form onSubmit={handleGradeSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Final Grade / Rating</label>
                                <input type="text" placeholder="e.g. A+, Exceptional Performance" className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 focus:border-red-600 outline-none transition-all font-bold" value={feedbackData.grade} onChange={(e) => setFeedbackData({ ...feedbackData, grade: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Personalized Comments</label>
                                <textarea rows="4" placeholder="Briefly summarize the student's strengths and areas for improvement..." className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 focus:border-red-600 outline-none transition-all resize-none" value={feedbackData.feedback} onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}></textarea>
                            </div>
                            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[24px] shadow-2xl ring-8 ring-red-600/5 transition-all">Publish Grade</button>
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
