// // frontend/src/pages/Auth/Login.jsx (REDESIGN & ALIGNMENT FIX)
// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";

// const API_BASE_URL = "http://localhost:8000/api/v1";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const response = await axios.post(`${API_BASE_URL}/login`, {
//         email,
//         password,
//       });
//       localStorage.setItem("accessToken", response.data.access_token);
//       navigate("/dashboard");
//     } catch (err) {
//       const message =
//         err.response?.data?.detail ||
//         "Login failed. Check server status and credentials.";
//       setError(message);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen p-6">
//       {/* FIX: max-w-md sets the card width, bg-v-bg-card sets the color */}
//       <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-v-bg-card text-v-text border border-v-accent/50">
//         <h2 className="text-3xl font-extrabold mb-8 text-center text-v-accent">
//           MERCHANT LOGIN
//         </h2>

//         {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

//         <form onSubmit={handleLogin} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium mb-1 text-v-text-muted">
//               Email:
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               // New input styling: dark background, accent focus ring
//               className="w-full p-3 rounded-lg border border-v-bg-dark bg-v-bg-mid text-v-text focus:ring-2 focus:ring-v-accent focus:border-v-accent"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1 text-v-text-muted">
//               Password:
//             </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="w-full p-3 rounded-lg border border-v-bg-dark bg-v-bg-mid text-v-text focus:ring-2 focus:ring-v-accent focus:border-v-accent"
//             />
//           </div>

//           <button
//   type="submit"
//   className="w-full py-3 rounded-lg bg-v-action text-white font-semibold hover:bg-v-accent focus:outline-none focus:ring-4 focus:ring-v-accent/40 transition-all duration-200 shadow-md"
// >
//   Login
// </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-v-text-muted">
//           Don't have an account?
//           <Link to="/register" className="ml-1 text-v-accent hover:underline">
//             Register here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;
// frontend/src/pages/Auth/Login.jsx (REDESIGN: Rectangular Card with Shape)
// frontend/src/pages/Auth/Login.jsx (REDESIGN - REPLACE ENTIRE FILE)
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
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      localStorage.setItem('accessToken', response.data.access_token);
      navigate('/dashboard');

    } catch (err) {
      const message = err.response?.data?.detail || "Login failed. Check server status and credentials.";
      setError(message);
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
    maxWidth: '400px', /* FIX: Constrains the width */
    padding: '40px',
    borderRadius: '16px', 
    backgroundColor: 'var(--color-card-bg)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    border: '1px solid var(--color-accent-strong)',
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
    // Uses the global button styling defined in index.css
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '10px', fontWeight: '800' }}>
          SUPPLY CHAIN
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '30px', fontSize: '1.2rem' }}>
          Automation Dashboard Login
        </p>

        {error && <p style={{ color: 'var(--color-accent-light)', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleLogin}>
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
            LOGIN
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;