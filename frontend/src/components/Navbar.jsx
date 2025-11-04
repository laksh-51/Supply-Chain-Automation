// frontend/src/components/Navbar.jsx (REVERTED TO EXTERNAL CSS CLASSES)
import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
    const location = useLocation();
    
    // Hide navbar on public routes
    if (location.pathname === '/' || location.pathname === '/register') {
        return null;
    }

    const userInitial = ''; 

    return (
        <header className="navbar-header">
            {/* Left Corner: Sidebar Toggle Symbol (Hamburger) */}
            <button 
                onClick={toggleSidebar} 
                className="navbar-toggle-button"
                title="Toggle Menu"
            >
                <Menu className="navbar-icon" />
            </button>

            {/* Right Corner: Account Initial in a Circle */}
            <div className="navbar-right-group">
                <div className="avatar-circle">
                    {userInitial}
                </div>
            </div>
        </header>
    );
};

export default Navbar;