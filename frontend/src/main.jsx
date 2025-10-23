// frontend/src/main.jsx (MODIFIED)
import { StrictMode, useState } from 'react' // ADDED useState
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // ADDED Navigate

// Import new layout components
import Sidebar from './components/Sidebar.jsx'; 
import Navbar from './components/Navbar.jsx';   

// Import necessary pages
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Dashboard from './pages/Dashboard/Home.jsx'; // Renaming Home to Dashboard
import InsightsDashboard from './pages/Dashboard/Insights/InsightsDashboard.jsx';
// NEW PAGE IMPORTS
import Workflows from './pages/Dashboard/Workflows.jsx'; // Will create this below
import History from './pages/Dashboard/History.jsx';     // Will create this below
import Chatbot from './components/Chatbot.jsx'; 
import './index.css'

// -----------------------------------------------------------
// 1. App Component (MODIFIED to include layout and state)
// -----------------------------------------------------------
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isAuthenticated = () => {
    return localStorage.getItem('accessToken'); 
  };
  
  const ProtectedLayout = ({ children }) => {
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
      {/* Public Routes */}
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes - Note: We wrap the page element in ProtectedLayout */}
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
        
        {/* Fallback route: If authenticated, go to Dashboard. Otherwise, go to Login. */}
        <Route 
            path="*" 
            element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/" />}
        />
      </Routes>
      
      {/* Chatbot remains outside the router, for persistence */}
      <Chatbot /> 
    </BrowserRouter>
  );
}
// -----------------------------------------------------------
// 2. THIS IS THE ORIGINAL CONTENT OF main.jsx (The Mount)
// -----------------------------------------------------------
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> {/* The combined application component */}
  </StrictMode>,
)