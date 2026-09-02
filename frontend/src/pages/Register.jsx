import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  ShieldAlert,
  LockKeyhole,
  Mail,
  User,
  Eye,
  EyeOff,
  UserRound,
  UserCog,
  Briefcase,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import "../styles/Login3d.css";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [specialization, setSpecialization] = useState("Search & Rescue");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Register in Backend API if available
      try {
        await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            email,
            fullName,
            role,
            specialization,
          }),
        });
      } catch (backendErr) {
        console.warn("Backend register API offline, continuing with Firebase auth:", backendErr);
      }

      // 3. Navigate to dashboard or login
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "trainer") {
        navigate("/trainer-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login3d">
      {/* 3D Background */}
      <div className="disaster-world">
        <div className="disaster-sky" />
        <div className="city-glow" />
        <div className="ground-grid" />
        <div className="hud-overlay" />
        <div className="scan-line" />

        <div className="hud-corner top-left" />
        <div className="hud-corner top-right" />
        <div className="hud-corner bottom-left" />
        <div className="hud-corner bottom-right" />
      </div>

      {/* Main Container */}
      <main className="login-interface" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px" }}>
        <section className="login-card" style={{ maxWidth: "480px", width: "100%", zIndex: 10 }}>
          <div className="card-header">
            <div className="security-badge">
              <ShieldAlert size={16} />
              <span>NEW OPERATIVE REGISTRATION</span>
            </div>
            <h2>Join Disaster Response Network</h2>
            <p>Create your VR training credential</p>
          </div>

          {error && (
            <div style={{ background: "rgba(255, 77, 87, 0.15)", border: "1px solid rgba(255, 77, 87, 0.4)", color: "#ff4d57", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="login-form">
            {/* Role Selection */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === "user" ? "active" : ""}`}
                onClick={() => setRole("user")}
              >
                <UserRound size={16} />
                <span>Trainee</span>
              </button>

              <button
                type="button"
                className={`role-btn ${role === "trainer" ? "active" : ""}`}
                onClick={() => setRole("trainer")}
              >
                <UserCog size={16} />
                <span>Instructor</span>
              </button>

              <button
                type="button"
                className={`role-btn ${role === "admin" ? "active" : ""}`}
                onClick={() => setRole("admin")}
              >
                <ShieldAlert size={16} />
                <span>Command</span>
              </button>
            </div>

            {/* Full Name */}
            <div className="input-group">
              <label>FULL NAME</label>
              <div className="input-box">
                <User size={17} />
                <input
                  type="text"
                  placeholder="e.g. Alex Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <label>COMMAND EMAIL</label>
              <div className="input-box">
                <Mail size={17} />
                <input
                  type="email"
                  placeholder="operative@disaster-ai.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Specialization */}
            <div className="input-group">
              <label>RESPONSE SPECIALIZATION</label>
              <div className="input-box">
                <Briefcase size={17} />
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  style={{ background: "transparent", color: "inherit", border: 0, width: "100%", outline: 0 }}
                >
                  <option value="Search & Rescue" style={{ background: "#0b1424" }}>Search & Rescue (SAR)</option>
                  <option value="Fire Hazard Response" style={{ background: "#0b1424" }}>Fire Hazard Response</option>
                  <option value="Medical First Responder" style={{ background: "#0b1424" }}>Medical First Responder</option>
                  <option value="Flood & Maritime Evacuation" style={{ background: "#0b1424" }}>Flood Evacuation</option>
                  <option value="Hazmat & Chemical Mitigation" style={{ background: "#0b1424" }}>Hazmat Mitigation</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label>SECURITY PASSPHRASE</label>
              <div className="input-box">
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <label>CONFIRM PASSPHRASE</label>
              <div className="input-box">
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter passphrase"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="enter-button" disabled={loading}>
              <span>{loading ? "INITIALIZING OPERATIVE..." : "CREATE COMMAND ACCOUNT"}</span>
              <ArrowRight size={19} />
            </button>
          </form>

          <div style={{ marginTop: "18px", textAlign: "center", fontSize: "12px", color: "var(--muted, #8d9ab3)" }}>
            Already have credentials?{" "}
            <Link to="/login" style={{ color: "var(--cyan, #31d6ff)", fontWeight: 700, textDecoration: "underline" }}>
              Sign in to Command Center
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
