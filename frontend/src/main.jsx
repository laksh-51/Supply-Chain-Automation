// frontend/src/main.jsx - FINAL VERSION (Includes Layout, Conditional Chatbot, and Typo Fix)

import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import necessary components/pages that define the application structure
import Sidebar from './components/Sidebar.jsx'; 
import Navbar from './components/Navbar.jsx';   

import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Dashboard from './pages/Dashboard/Home.jsx'; // Renamed Home to Dashboard
import Workflows from './pages/Dashboard/Workflows.jsx'; 
import History from './pages/Dashboard/History.jsx';     
import InsightsDashboard from './pages/Dashboard/Insights/InsightsDashboard.jsx';
import Chatbot from './components/Chatbot.jsx'; 
import './index.css'

// -----------------------------------------------------------
// 1. App Component (Container for Layout and Routing)
// -----------------------------------------------------------
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Checks if a valid token exists for authentication
  const isAuthenticated = () => {
    return localStorage.getItem('accessToken'); 
  };
  
  // Custom component wrapper for all protected routes (Replaces original Routes structure)
  const ProtectedLayout = ({ children }) => {
    // FIX: Uses the correct 'isAuthenticated()' function
    if (!isAuthenticated()) {
        return <Navigate to="/" />;
    }
    
    // The main application layout with Sidebar and Navbar
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />
            
            {/* Main Content Area */}
            <div 
                className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}
                style={{ marginLeft: isSidebarOpen ? '16rem' : '0' }}
            >
                {/* Navbar (Header) */}
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
  };
    
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes - All use ProtectedLayout */}
        <Route 
            path="/dashboard" 
            element={<ProtectedLayout><Dashboard /></ProtectedLayout>} 
        /> 
        <Route 
            path="/insights" 
            element={<ProtectedLayout><InsightsDashboard /></ProtectedLayout>} 
        />
        <Route 
            path="/workflows" 
            element={<ProtectedLayout><Workflows /></ProtectedLayout>} 
        />
        <Route 
            path="/history" 
            element={<ProtectedLayout><History /></ProtectedLayout>} 
        />
        
        {/* Fallback route: Redirect to Login if unauthenticated, or Dashboard if authenticated */}
        <Route 
            path="*" 
            element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/" />}
        />
      </Routes>
      
      {/* Chatbot Control (Point 3.1) - Renders only when authenticated */}
      {isAuthenticated() && <Chatbot />} 
    </BrowserRouter>
  );
}

// -----------------------------------------------------------
// 2. The Mount
// -----------------------------------------------------------
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> 
  </StrictMode>,
)