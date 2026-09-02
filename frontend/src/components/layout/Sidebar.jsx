import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  Map,
  Bot,
  Bell,
  Package,
  BarChart3,
  GraduationCap,
  History,
  Brain,
  UserCheck,
  UserCog,
  Settings,
  ShieldAlert,
  X,
} from "lucide-react";

const nav = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/simulations", "VR Simulations", Box],
  ["/map", "Disaster Map", Map],
  ["/ai-assistant", "AI Assistant", Bot],
  ["/alerts", "Alerts & Notifications", Bell],
  ["/resources", "Resource Management", Package],
  ["/analytics", "Analytics & Reports", BarChart3],
  ["/training", "Training & Courses", GraduationCap],
  ["/training-history", "Training History", History],
  ["/skill-twin", "Digital Skill Twin", Brain],
  ["/trainee-profile", "Trainee Profile", UserCheck],
  ["/trainer-dashboard", "Trainer Control", UserCog],
  ["/settings", "Settings", Settings],
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const handleNavClick = () => {
    // Close sidebar after selecting a page on mobile
    if (window.innerWidth <= 850) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>

        {/* =========================
            BRAND
        ========================== */}
        <div className="brand">
          <div className="brand-mark">
            <ShieldAlert />
          </div>

          <div>
            <strong>VR DISASTER</strong>
            <span>MANAGEMENT AI</span>
          </div>

          {/* Mobile close button */}
          <button
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* =========================
            NAVIGATION
        ========================== */}
        <nav>
          {nav.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                isActive
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              <Icon />

              <span>{label}</span>

              {label.startsWith("Alerts") && (
                <b></b>
              )}
            </NavLink>
          ))}
        </nav>

        {/* =========================
            USER
        ========================== */}
        <div className="user-card">
          <div className="avatar">
            GT
          </div>

          <div>
            <strong>Gaurav Thakur</strong>
            <span>Administrator</span>
          </div>

          <i />
        </div>

      </aside>
    </>
  );
}