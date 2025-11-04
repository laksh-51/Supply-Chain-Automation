// // frontend/src/components/Sidebar.jsx (MODIFIED with Tailwind)
// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Power, Settings, Clock, LayoutDashboard, Database } from 'lucide-react'; 

// const navItems = [
//     { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }, 
//     { name: 'My Workflows', path: '/workflows', icon: Settings },
//     { name: 'History', path: '/history', icon: Clock },
//     { name: 'Insights', path: '/insights', icon: Database }, 
// ];

// const Sidebar = ({ isOpen }) => {
//     const location = useLocation();

//     const handleLogout = () => {
//         localStorage.removeItem('accessToken'); 
//         window.location.href = '/'; 
//     };

//     return (
//         <div 
//             className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
//                       transition-transform duration-300 ease-in-out w-64 shadow-2xl z-30 
//                       bg-v-bg-secondary text-v-text-light`}
//         >
//             <div className="p-4 text-2xl font-extrabold border-b h-16 flex items-center text-v-accent-high border-v-bg-card">
//                 SC.Automation
//             </div>
            
//             <nav className="flex flex-col p-4 space-y-2">
//                 {navItems.map((item) => {
//                     const isActive = location.pathname.startsWith(item.path);
//                     return (
//                         <Link
//                             key={item.name}
//                             to={item.path}
//                             className={`flex items-center p-3 rounded-lg transition-colors 
//                                         ${isActive 
//                                             ? 'bg-v-accent-low text-v-text-light font-semibold' 
//                                             : 'text-v-text-light hover:bg-v-bg-card hover:text-v-accent-high'}`}
//                         >
//                             <item.icon className="w-5 h-5 mr-3" />
//                             {item.name}
//                         </Link>
//                     );
//                 })}
//             </nav>
            
//             {/* Logout Button (moved to sidebar bottom) */}
//             <div className="absolute bottom-0 w-full p-4 border-t border-v-bg-card">
//                 <button
//                     onClick={handleLogout}
//                     className="flex items-center w-full p-3 rounded-lg text-v-accent-high hover:bg-v-bg-card transition-colors bg-transparent"
//                 >
//                     <Power className="w-5 h-5 mr-3" />
//                     Logout
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Sidebar;

// frontend/src/components/Sidebar.jsx (REPLACE WITH THIS CODE)
// frontend/src/components/Sidebar.jsx (REDESIGN - REPLACE ENTIRE FILE)
// frontend/src/components/Sidebar.jsx (REPLACED WITH STABLE FUNCTION DECLARATION)
// frontend/src/components/Sidebar.jsx (FINAL STABLE UI - FIXES PREAMBLE ERROR)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Power, Settings, Clock, LayoutDashboard, BarChart3 } from 'lucide-react'; 

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }, 
    { name: 'My Workflows', path: '/workflows', icon: Settings },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'Insights', path: '/insights', icon: BarChart3 }, 
];

// --- Sidebar Component Definition (Must be a clean function definition) ---
function Sidebar({ isOpen }) { 
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('accessToken'); 
        window.location.href = '/'; 
    };

    const baseStyle = {
        position: 'fixed',
        insetY: 0,
        left: 0,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        width: '16rem',
        backgroundColor: 'var(--color-bg-mid)',
        color: 'var(--color-text-primary)',
        boxShadow: '4px 0 10px rgba(0, 0, 0, 0.5)',
        zIndex: 30
    };

    const linkStyle = (path) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        borderRadius: '8px',
        transition: 'background-color 0.2s, color 0.2s',
        color: location.pathname.startsWith(path) ? 'white' : 'var(--color-text-muted)',
        backgroundColor: location.pathname.startsWith(path) ? 'var(--color-accent-strong)' : 'transparent',
        fontWeight: location.pathname.startsWith(path) ? 'bold' : 'normal',
    });

    const linkHoverStyle = {
        backgroundColor: 'var(--color-card-bg)',
        color: 'var(--color-text-primary)',
    };

    return (
        <div style={baseStyle}>
            {/* Header */}
            <div 
              style={{padding: '16px', fontSize: '1.5rem', fontWeight: '800', borderBottom: '1px solid var(--color-card-bg)', height: '64px', display: 'flex', alignItems: 'center', color: 'var(--color-accent-light)'}}
            >
                SC.Automation
            </div>
            
            {/* Navigation Links */}
            <nav style={{display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px'}}>
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        style={linkStyle(item.path)}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = linkHoverStyle.backgroundColor}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = linkStyle(item.path).backgroundColor}
                    >
                        <item.icon style={{width: '20px', height: '20px', marginRight: '12px'}} />
                        {item.name}
                    </Link>
                ))}
            </nav>
            
            {/* Logout Button */}
            <div style={{position: 'absolute', bottom: 0, width: '100%', padding: '16px', borderTop: '1px solid var(--color-card-bg)'}}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'transparent',
                        color: 'var(--color-accent-light)',
                        border: 'none',
                        transition: 'all 0.25s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-card-bg)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Power style={{width: '20px', height: '20px', marginRight: '12px'}} />
                    Logout
                </button>
            </div>
        </div>
    );
} 

// CRITICAL: The clean, final top-level export
export default Sidebar;