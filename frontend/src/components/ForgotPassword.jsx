// File: src/components/ForgotPassword.jsx
import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { officialMailId: email },
        { headers: { "Content-Type": "application/json" } }
      );
      setMsg(res.data.msg || "Reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.msg || "Error sending reset link.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow" style={{ width: "100%", maxWidth: 400 }}>
        <h3 className="text-center mb-4">Forgot Password</h3>

        {msg && <div className="alert alert-success">{msg}</div>}
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

        <button type="submit" className="btn btn-primary w-100">Send Reset Link</button>

        <div className="mt-3 text-center">
          <a href="/login" className="text-decoration-none">Back to Login</a>
        </div>
      </form>
    </div>
  );
}
