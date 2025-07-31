// src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // <-- use context

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        officialMailId: email,
        password,
      });

      const { token, user } = res.data;

      // put in context (this also syncs to localStorage)
      login(user, token);

      // redirect based on role
      const role = user.role.toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "hr") navigate("/hr");
      else if (role === "staff") navigate("/staff");
      else navigate("/unauthorized");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Login failed.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <form onSubmit={handleLogin} className="p-4 border rounded shadow" style={{ width: "100%", maxWidth: 400 }}>
        <h3 className="text-center mb-4">Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Official Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3 text-end">
          {/* If you really want a reset page, make it /reset-password/:token later */}
          <a href="/reset-password" className="text-decoration-none">
            Forgot Password?
          </a>
        </div>

        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}
