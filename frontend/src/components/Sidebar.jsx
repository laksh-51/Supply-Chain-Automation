// frontend/src/components/Sidebar.jsx (REVERTED TO EXTERNAL CSS CLASSES)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Power, Settings, Clock, LayoutDashboard, BarChart3 } from 'lucide-react'; 
// No explicit CSS import needed as it's handled by main.jsx

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }, 
    { name: 'My Workflows', path: '/workflows', icon: Settings },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'Insights', path: '/insights', icon: BarChart3 }, 
];

function Sidebar({ isOpen }) { 
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('accessToken'); 
        window.location.href = '/'; 
    };
    
    // Use CSS classes and map state to classes
    const sidebarClass = isOpen ? 'sidebar-container' : 'sidebar-container collapsed';

    return (
        <div className={sidebarClass}>
            {/* Header */}
            <div className="sidebar-header">
                SC-Automation
            </div>
            
            {/* Navigation Links */}
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={isActive ? 'nav-link active' : 'nav-link'}
                        >
                            <item.icon className="nav-icon" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            
            {/* Logout Button */}
            <div className="sidebar-logout-area">
                <button
                    onClick={handleLogout}
                    className="logout-button"
                >
                    <Power className="nav-icon" />
                    Logout
                </button>
            </div>
        </div>
    );
} 

export default Sidebar;