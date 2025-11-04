// frontend/src/pages/Auth/Register.jsx (FINAL STABLE UI)
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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

  /* --- Styles to fix stretching and center the card --- */
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '400px', 
    padding: '40px',
    borderRadius: '16px', 
    backgroundColor: 'var(--color-card-bg)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    border: '1px solid var(--color-accent-strong)',
    color: 'var(--color-text-primary)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    border: '1px solid var(--color-accent-strong)',
    backgroundColor: 'var(--color-bg-mid)',
    color: 'var(--color-text-primary)',
    marginBottom: '20px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    marginTop: '20px',
    fontWeight: 'bold',
    fontSize: '1em',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '10px', fontWeight: '800' }}>
          CREATE ACCOUNT
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '30px', fontSize: '1.2rem' }}>
          Supply Chain Merchant
        </p>
        
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
        {message && <p style={{ color: 'var(--color-accent-light)', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}

        <form onSubmit={handleRegister}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Full Name:</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            REGISTER
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;