// frontend/src/components/Sidebar.jsx (MODIFIED with Tailwind)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Power, Settings, Clock, LayoutDashboard, Database } from 'lucide-react'; 

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }, 
    { name: 'My Workflows', path: '/workflows', icon: Settings },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'Insights', path: '/insights', icon: Database }, 
];

const Sidebar = ({ isOpen }) => {
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('accessToken'); 
        window.location.href = '/'; 
    };

    return (
        <div 
            className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                      transition-transform duration-300 ease-in-out w-64 shadow-2xl z-30 
                      bg-v-bg-secondary text-v-text-light`}
        >
            <div className="p-4 text-2xl font-extrabold border-b h-16 flex items-center text-v-accent-high border-v-bg-card">
                SC.Automation
            </div>
            
            <nav className="flex flex-col p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center p-3 rounded-lg transition-colors 
                                        ${isActive 
                                            ? 'bg-v-accent-low text-v-text-light font-semibold' 
                                            : 'text-v-text-light hover:bg-v-bg-card hover:text-v-accent-high'}`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            
            {/* Logout Button (moved to sidebar bottom) */}
            <div className="absolute bottom-0 w-full p-4 border-t border-v-bg-card">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg text-v-accent-high hover:bg-v-bg-card transition-colors bg-transparent"
                >
                    <Power className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;