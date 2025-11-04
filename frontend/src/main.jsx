// frontend/src/main.jsx - FINAL VERSION (Includes Layout, Conditional Chatbot, and Typo Fix)

import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import necessary components/pages that define the application structure
import Sidebar from './components/Sidebar.jsx'; 
import Navbar from './components/Navbar.jsx';   

import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Dashboard from './pages/Dashboard/Home.jsx'; 
import Workflows from './pages/Dashboard/Workflows.jsx'; // <-- CORRECTED
import History from './pages/Dashboard/History.jsx';     
import InsightsDashboard from './pages/Dashboard/Insights/InsightsDashboard.jsx';
import Chatbot from './components/Chatbot.jsx'; 

// Import core and component-specific CSS
import './index.css'
import './components/layout.css'; // <-- CHECK: Must exist at src/components/layout.css

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
    if (!isAuthenticated()) {
        return <Navigate to="/" />;
    }
    
    // Use external CSS classes for layout structure
    const mainContentClass = isSidebarOpen ? 'main-content-area shifted' : 'main-content-area unshifted';
    
    return (
        // Revert class names from Tailwind utilities to semantic CSS classes
        <div className="app-container">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />
            
            {/* Main Content Area */}
            <div 
                className={mainContentClass} // Use computed class name
            >
                {/* Navbar (Header) */}
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                
                <main className="main-page-content"> {/* Use semantic class name */}
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
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} /> 
        <Route path="/insights" element={<ProtectedLayout><InsightsDashboard /></ProtectedLayout>} />
        <Route path="/workflows" element={<ProtectedLayout><Workflows /></ProtectedLayout>} />
        <Route path="/history" element={<ProtectedLayout><History /></ProtectedLayout>} />
        
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