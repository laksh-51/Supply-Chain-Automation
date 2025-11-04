// frontend/src/components/Navbar.jsx (FINAL STABLE UI)
import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
    const location = useLocation();
    
    // Hide navbar on public routes
    if (location.pathname === '/' || location.pathname === '/register') {
        return null;
    }

    // Fix: Empty initial for the avatar
    const userInitial = ''; 

    const baseStyle = {
        height: '64px', 
        padding: '0 24px', 
        backgroundColor: 'var(--color-bg-mid)', /* Dark accent color */
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        borderBottom: '1px solid var(--color-card-bg)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    };

    const buttonStyle = {
        padding: '8px',
        borderRadius: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    };

    return (
        <header style={baseStyle}>
            {/* Left Corner: Sidebar Toggle Symbol (Hamburger) */}
            <button 
                onClick={toggleSidebar} 
                style={buttonStyle}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-card-bg)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Toggle Menu"
            >
                <Menu style={{ width: '24px', height: '24px', color: 'var(--color-accent-light)' }} />
            </button>

            {/* Right Corner: Account Initial in a Circle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: '600',
                    backgroundColor: 'var(--color-accent-light)', /* Bright circle */
                    color: 'var(--color-bg-mid)', /* Dark text */
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                    {userInitial}
                </div>
            </div>
        </header>
    );
};

export default Navbar;