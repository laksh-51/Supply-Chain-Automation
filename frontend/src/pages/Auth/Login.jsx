// frontend/src/pages/Auth/Login.jsx (REDESIGN & ALIGNMENT FIX)
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api/v1";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });
      localStorage.setItem("accessToken", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Login failed. Check server status and credentials.";
      setError(message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      {/* FIX: max-w-md sets the card width, bg-v-bg-card sets the color */}
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-v-bg-card text-v-text border border-v-accent/50">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-v-accent">
          MERCHANT LOGIN
        </h2>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-v-text-muted">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              // New input styling: dark background, accent focus ring
              className="w-full p-3 rounded-lg border border-v-bg-dark bg-v-bg-mid text-v-text focus:ring-2 focus:ring-v-accent focus:border-v-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-v-text-muted">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-v-bg-dark bg-v-bg-mid text-v-text focus:ring-2 focus:ring-v-accent focus:border-v-accent"
            />
          </div>

          <button
  type="submit"
  className="w-full py-3 rounded-lg bg-v-action text-white font-semibold hover:bg-v-accent focus:outline-none focus:ring-4 focus:ring-v-accent/40 transition-all duration-200 shadow-md"
>
  Login
</button>
        </form>

        <p className="mt-6 text-center text-sm text-v-text-muted">
          Don't have an account?
          <Link to="/register" className="ml-1 text-v-accent hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
