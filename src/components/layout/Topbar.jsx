import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Bell,
  Mail,
  HelpCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";

export default function Topbar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim().toLowerCase();

    if (!value) return;

    const routes = {
      dashboard: "/dashboard",
      simulations: "/simulations",
      "vr simulations": "/simulations",
      map: "/map",
      "disaster map": "/map",
      alerts: "/alerts",
      notifications: "/alerts",
      resources: "/resources",
      analytics: "/analytics",
      training: "/training",
      "skill twin": "/skill-twin",
      "digital skill twin": "/skill-twin",
      settings: "/settings",
      "ai assistant": "/ai-assistant",
      admin: "/admin",
      profile: "/admin",
      help: "/help",
      messages: "/messages",
    };

    const route = routes[value];

    if (route) {
      navigate(route);
      setSearch("");
    } else {
      alert(`No page found for "${search}"`);
    }
  };

  return (
    <header className="topbar">

      {/* =========================
          MOBILE HAMBURGER
      ========================== */}
      <button
        className={`hamb ${isOpen ? "active" : ""}`}
        aria-label={
          isOpen ? "Close menu" : "Open menu"
        }
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <>
            <span />
            <span />
            <span />
          </>
        )}
      </button>

      {/* =========================
          PAGE TITLE
      ========================== */}
      <h1>Dashboard</h1>

      {/* =========================
          SEARCH
      ========================== */}
      <form
        className="search"
        onSubmit={handleSearch}
      >
        <Search size={18} />

        <input
          type="text"
          placeholder="Search anything..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <kbd></kbd>
      </form>

      {/* =========================
          ACTIONS
      ========================== */}
      <div className="top-actions">

        {/* Notifications */}
        <button
          aria-label="Notifications"
          onClick={() => navigate("/alerts")}
        >
          <Bell />
          <em>5</em>
        </button>

        {/* Messages */}
        <button
          aria-label="Messages"
          onClick={() => navigate("/messages")}
        >
          <Mail />
          <em>2</em>
        </button>

        {/* Help */}
        <button
          aria-label="Help"
          onClick={() => navigate("/help")}
        >
          <HelpCircle />
        </button>

        {/* =========================
            PROFILE
        ========================== */}
        <div className="profile-wrapper">

          <button
            className="profile"
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
          >
            <div className="avatar small">
              GT
            </div>

            <strong>
              Gaurav Thakur
            </strong>

            <ChevronDown size={16} />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="profile-menu">

              <button
                onClick={() => {
                  navigate("/admin");
                  setProfileOpen(false);
                }}
              >
                <User size={16} />
                Admin Profile
              </button>

              <button
                onClick={() => {
                  navigate("/settings");
                  setProfileOpen(false);
                }}
              >
                <Settings size={16} />
                Settings
              </button>

              <button
                onClick={() => {
                  alert(
                    "Logout functionality will be connected to backend."
                  );
                  setProfileOpen(false);
                }}
              >
                <LogOut size={16} />
                Logout
              </button>

            </div>
          )}

        </div>
      </div>
    </header>
  );
}