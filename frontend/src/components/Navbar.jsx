// frontend/src/components/Navbar.jsx (MODIFIED with Tailwind)
import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
    const location = useLocation();
    
    if (location.pathname === '/' || location.pathname === '/register') {
        return null;
    }

    // Empty initial as requested
    const userInitial = ''; 

    return (
        <header 
            className="h-16 flex items-center justify-between px-6 shadow-md z-20 
                       bg-v-bg-secondary border-b border-v-bg-card"
        >
            {/* Left Corner: Sidebar Toggle Symbol (Hamburger) */}
            <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-md hover:bg-v-bg-card transition-colors"
                title="Toggle Menu"
            >
                <Menu className="w-6 h-6 text-v-accent-high" />
            </button>

            {/* Right Corner: Account Initial in a Circle */}
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-md 
                            bg-v-accent-high text-v-bg-secondary"> 
                    {userInitial}
                </div>
            </div>
        </header>
    );
};

export default Navbar;