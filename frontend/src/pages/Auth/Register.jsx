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
      const response = await axios.post(`${API_BASE_URL}/register`, {
        email: email,
        password: password,
        full_name: fullName,
      });

      setMessage("Registration successful! You can now log in.");
      // Optional: Redirect to login page after a delay
      setTimeout(() => navigate('/'), 2000); 

    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      setError(msg);
      console.error("Registration Error:", err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Merchant Registration</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '15px' }}>
          <label>Full Name:</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
}

export default Register;