// frontend/src/pages/Auth/Register.jsx (REVERTED TO EXTERNAL CSS CLASSES)
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Import local component CSS
import '../auth.css'; // <-- NEW IMPORT

const API_BASE_URL = "http://localhost:8000/api/v1"; 

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/register`, {
        email: email,
        password: password,
        full_name: fullName,
      });

      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate('/'), 2000); 

    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      setError(msg);
      console.error("Registration Error:", err);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          CREATE ACCOUNT
        </h2>
        <p className="auth-subtitle">
          Supply Chain Merchant
        </p>
        
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name:</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
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
            REGISTER
          </button>
        </form>

        <p className="auth-link-text">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;