import React from 'react';
import {
    LayoutDashboard,
    User,
    LogOut,
    PlusCircle,
    Users,
    ClipboardList,
    TrendingUp,
    Settings,
    ChevronRight,
    Calendar
} from 'lucide-react';

const Sidebar = ({ role, activeTab, setActiveTab, user, handleLogout }) => {
    const teacherLinks = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'assign', label: 'Assign LU', icon: PlusCircle },
        { id: 'profile', label: 'My Profile', icon: User },
    ];

    const studentLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
        { id: 'curriculum', label: 'My Curriculum', icon: ClipboardList },
        { id: 'calendar', label: 'LU Calendar', icon: Calendar },
        { id: 'profile', label: 'My Profile', icon: User },
    ];

    const links = role === 'teacher' ? teacherLinks : studentLinks;

    return (
        <aside className="w-64 min-h-screen bg-[#1E1E1E] border-r border-white/5 flex flex-col sticky top-0">
            {/* Branding */}
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-900/20">
                        <ClipboardList className="text-white" size={24} />
                    </div>
                    <span className="font-black text-xl tracking-tighter">KALVIUM<span className="text-red-600">.</span></span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest px-4 mb-4">Main Menu</p>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = activeTab === link.id;
                    return (
                        <button
                            key={link.id}
                            onClick={() => setActiveTab(link.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${isActive
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-red-500'} />
                                <span className="font-bold text-sm">{link.label}</span>
                            </div>
                            {isActive && <ChevronRight size={14} />}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile Summary & Logout */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600 border border-red-600/20">
                        <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest">{user?.role || 'Guest'}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-bold text-sm"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
