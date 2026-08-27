import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Radio,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  UserRound,
  UserCog,
  Activity,
  Crosshair,
} from "lucide-react";

import "../styles/login3d.css";

export default function Login() {
  const navigate = useNavigate();

  const [booting, setBooting] = useState(true);
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    /*
      Temporary frontend navigation.

      Later we will replace this with:
      Firebase / Backend authentication
      + role verification.
    */

    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="login3d">

      {/* =====================================================
          3D BACKGROUND
      ====================================================== */}

      <div className="disaster-world">

        {/* Sky */}
        <div className="disaster-sky" />

        {/* Distant glow */}
        <div className="city-glow" />

        {/* Buildings */}
        <div className="city">

          <div className="building building-1">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="building building-2">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="building building-3">
            <span />
            <span />
            <span />
          </div>

          <div className="building building-4">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="building building-5">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

        </div>

        {/* Ground */}
        <div className="ground-grid" />

        {/* Smoke */}
        <div className="smoke smoke-1" />
        <div className="smoke smoke-2" />
        <div className="smoke smoke-3" />

        {/* Fire */}
        <div className="fire fire-1">
          <i />
          <i />
          <i />
        </div>

        <div className="fire fire-2">
          <i />
          <i />
        </div>

        {/* Floating disaster particles */}
        <div className="particles">
          {Array.from({ length: 35 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        {/* Radar */}
        <div className="radar">
          <div className="radar-circle circle-1" />
          <div className="radar-circle circle-2" />
          <div className="radar-circle circle-3" />
          <div className="radar-line" />

          <div className="radar-point point-1" />
          <div className="radar-point point-2" />
          <div className="radar-point point-3" />
        </div>

      </div>

      {/* =====================================================
          HUD OVERLAY
      ====================================================== */}

      <div className="hud-overlay">

        <div className="scan-line" />

        <div className="hud-corner top-left" />
        <div className="hud-corner top-right" />
        <div className="hud-corner bottom-left" />
        <div className="hud-corner bottom-right" />

      </div>

      {/* =====================================================
          BOOT SCREEN
      ====================================================== */}

      {booting && (
        <div className="boot-screen">

          <div className="boot-symbol">
            <ShieldAlert size={48} />
          </div>

          <div className="boot-title">
            DISASTER RESPONSE NETWORK
          </div>

          <div className="boot-status">
            INITIALIZING TRAINING ENVIRONMENT
          </div>

          <div className="boot-progress">
            <span />
          </div>

          <div className="boot-code">
            SYSTEM://VR-DM-AI
          </div>

        </div>
      )}

      {/* =====================================================
          MAIN LOGIN INTERFACE
      ====================================================== */}

      {!booting && (
        <main className="login-interface">

          {/* =================================================
              TOP SYSTEM BAR
          ================================================== */}

          <header className="system-bar">

            <div className="system-brand">

              <div className="brand-icon">
                <ShieldAlert size={23} />
              </div>

              <div>
                <strong>VR-DM</strong>
                <small>
                  DISASTER MANAGEMENT SYSTEM
                </small>
              </div>

            </div>

            <div className="system-status">

              <span className="status-dot" />

              <span>SYSTEM ONLINE</span>

              <Activity size={16} />

            </div>

          </header>

          {/* =================================================
              LEFT INFORMATION
          ================================================== */}

          <section className="mission-info">

            <div className="mission-label">
              <Radio size={15} />
              LIVE RESPONSE NETWORK
            </div>

            <h1>
              ENTER THE
              <span> DISASTER </span>
              SIMULATION
            </h1>

            <p>
              Immersive virtual reality training for
              emergency response, disaster management
              and decision-making.
            </p>

            <div className="mission-stats">

              <div>
                <Activity size={17} />
                <span>
                  <b>ACTIVE</b>
                  RESPONSE SYSTEM
                </span>
              </div>

              <div>
                <Crosshair size={17} />
                <span>
                  <b>VR</b>
                  TRAINING READY
                </span>
              </div>

            </div>

            <div className="coordinates">
              <span>LAT 19.0760°</span>
              <span>LON 72.8777°</span>
              <span>ZONE MUMBAI</span>
            </div>

          </section>

          {/* =================================================
              LOGIN CARD
          ================================================== */}

          <section className="login-card">

            <div className="card-top">

              <div>

                <small>SECURE ACCESS</small>

                <h2>
                  COMMAND LOGIN
                </h2>

              </div>

              <div className="lock-icon">
                <LockKeyhole size={20} />
              </div>

            </div>

            {/* Role selector */}

            <div className="role-selector">

              <button
                type="button"
                className={role === "user" ? "active" : ""}
                onClick={() => setRole("user")}
              >
                <UserRound size={17} />

                <span>
                  <b>USER</b>
                  TRAINEE
                </span>
              </button>

              <button
                type="button"
                className={role === "admin" ? "active" : ""}
                onClick={() => setRole("admin")}
              >
                <UserCog size={17} />

                <span>
                  <b>ADMIN</b>
                  COMMAND
                </span>
              </button>

            </div>

            {/* Login form */}

            <form onSubmit={handleLogin}>

              <label>
                ACCESS ID
              </label>

              <div className="input-box">

                <Mail size={17} />

                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>

              <label>
                SECURITY KEY
              </label>

              <div className="input-box">

                <LockKeyhole size={17} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

              <div className="form-options">

                <label className="remember">
                  <input type="checkbox" />
                  <span>Remember access</span>
                </label>

                <button
                  type="button"
                  className="forgot"
                >
                  Forgot password?
                </button>

              </div>

              <button
                type="submit"
                className="enter-button"
              >

                <span>
                  ENTER COMMAND CENTER
                </span>

                <ShieldAlert size={19} />

              </button>

            </form>

            <div className="security-message">

              <LockKeyhole size={14} />

              <span>
                ENCRYPTED SECURE CONNECTION
              </span>

            </div>

          </section>

          {/* =================================================
              BOTTOM STATUS
          ================================================== */}

          <footer className="system-footer">

            <span>
              VR-DM-AI PLATFORM
            </span>

            <span>
              TRAINING ENVIRONMENT v1.0
            </span>

            <span>
              <i />
              ALL SYSTEMS OPERATIONAL
            </span>

          </footer>

        </main>
      )}

    </div>
  );
}