// frontend/src/components/Navbar.jsx (NEW FILE)
import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
    const location = useLocation();
    
    // Hide navbar on public routes
    if (location.pathname === '/' || location.pathname === '/register') {
        return null;
    }

    // Placeholder for user initial (replace with actual logic if user info is stored)
    const userInitial = 'L'; 

    return (
        <header 
            style={{ height: '64px', padding: '0 24px', backgroundColor: '#FFFFFF' }}
            className="flex items-center justify-between border-b shadow-sm z-20"
        >
            {/* Left Corner: Sidebar Toggle Symbol */}
            <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                title="Toggle Menu"
            >
                <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Right Corner: Account Initial in a Circle */}
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {userInitial}
                </div>
            </div>
        </header>
    );
};

export default Navbar;