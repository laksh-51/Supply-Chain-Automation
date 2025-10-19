import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
      // Axios sends the form data (FastAPI expects x-www-form-urlencoded, but Pydantic can handle JSON body too)
      // For this simple example, we'll send JSON body
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: email,
        password: password,
      });

      // On successful login, store the token
      localStorage.setItem('accessToken', response.data.access_token);
      
      // Redirect to the protected dashboard
      navigate('/dashboard');

    } catch (err) {
      // Handle 401 Unauthorized or other errors
      const message = err.response?.data?.detail || "Login failed. Check server status and credentials.";
      setError(message);
      console.error("Login Error:", err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Merchant Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;