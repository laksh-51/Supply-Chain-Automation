// frontend/src/main.jsx - CONSOLIDATED ENTRY FILE

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import necessary components/pages that define the application structure
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Home from './pages/Dashboard/Home.jsx'; 
import InsightsDashboard from './pages/Dashboard/Insights/InsightsDashboard.jsx';
import Chatbot from './components/Chatbot.jsx'; // <-- NEW IMPORT
import './index.css'

// -----------------------------------------------------------
// 1. THIS IS THE ORIGINAL CONTENT OF App.jsx (renamed to App)
// -----------------------------------------------------------
function App() {
  return (
    <BrowserRouter>
      {/* The Routes component handles conditional rendering based on the URL */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Home />} /> 
        <Route path="/insights" element={<InsightsDashboard />} />
        {/* Add any other protected routes here */}
      </Routes>
      
      {/* Chatbot is a persistent element that renders on every page, 
          so it must be outside the <Routes> block but inside <BrowserRouter> */}
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