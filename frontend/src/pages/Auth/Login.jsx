// frontend/src/pages/Auth/Login.jsx (REVERTED TO EXTERNAL CSS CLASSES)
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Import local component CSS
import '../auth.css'; // <-- NEW IMPORT

const API_BASE_URL = "http://localhost:8000/api/v1"; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      localStorage.setItem('accessToken', response.data.access_token);
      navigate('/dashboard');

    } catch (err) {
      const message = err.response?.data?.detail || "Login failed. Check server status and credentials.";
      setError(message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          SUPPLY CHAIN
        </h2>
        <p className="auth-subtitle">
          Automation Dashboard Login
        </p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
          <button type="submit" className="auth-button">
            LOGIN
          </button>
        </form>

        <p className="auth-link-text">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;