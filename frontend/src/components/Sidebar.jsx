// frontend/src/components/Sidebar.jsx (NEW FILE)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Power, Settings, Clock, LayoutDashboard } from 'lucide-react'; 

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }, 
    { name: 'My Workflows', path: '/workflows', icon: Settings },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'Insights', path: '/insights', icon: LayoutDashboard }, // Insights for visualization
];

const Sidebar = ({ isOpen }) => {
    const location = useLocation();

    const handleLogout = () => {
        // Use 'accessToken' as defined in Login.jsx
        localStorage.removeItem('accessToken'); 
        window.location.href = '/'; // Redirect to the Login page (which is '/')
    };

    return (
        // The fixed positioning and transition handle the hidden/expanded state
        <div 
            className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                      transition-transform duration-300 ease-in-out w-64 bg-white shadow-xl z-30`}
            style={{ 
                width: '16rem', 
                backgroundColor: '#2D3748', // Dark background for professional look
                color: 'white'
            }}
        >
            <div className="p-4 text-xl font-bold border-b border-gray-600 h-16 flex items-center">
                SC Automation
            </div>
            
            <nav className="flex flex-col p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center p-3 rounded-lg transition-colors text-white 
                                        ${isActive ? 'bg-indigo-600 font-semibold' : 'hover:bg-gray-700'}`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            
            {/* Logout Button (moved to sidebar bottom) */}
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-600">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <Power className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;