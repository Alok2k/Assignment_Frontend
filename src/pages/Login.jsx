
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppContext from "../context/AppContext";


export default function Login() {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useContext(AppContext);
  const nav = useNavigate();
  const apiUrl = import.meta.env.REACT_APP_API_URL;// In frontend/src/api.js
  import axios from 'axios';
  
  // Create an Axios instance
  const api = axios.create({
    
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:6446'
  });
  
  export default api;
  

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (!username || !password || (mode === "signup" && !email)) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      let res;
      if (mode === "login") {
        res = await axios.post(`${apiUrl}/login`, { username, password });
      } else {
        res = await axios.post(`${apiUrl}/signup`, { username, email, password });
      }

      const user = res.data.user;
      setUser(user); 
      nav("/"); // redirect home
    } catch (err) {
      console.error(`${mode} error:`, err);
      setError(err.response?.data?.error || `${mode} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{mode === "login" ? "Login" : "Sign Up"}</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyPress}
        className="w-full p-2 mb-3 border rounded"
      />

      {mode === "signup" && (
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full p-2 mb-3 border rounded"
        />
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyPress}
        className="w-full p-2 mb-3 border rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full p-2 text-white rounded ${loading ? "bg-gray-400" : "bg-green-600"}`}
      >
        {loading ? (mode === "login" ? "Logging in..." : "Signing up...") : (mode === "login" ? "Login" : "Sign Up")}
      </button>

      <div className="mt-4 text-center text-sm text-gray-600">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <button onClick={() => setMode("signup")} className="text-green-600 font-semibold">Sign Up</button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button onClick={() => setMode("login")} className="text-green-600 font-semibold">Login</button>
          </>
        )}
      </div>
    </div>
  );
}
