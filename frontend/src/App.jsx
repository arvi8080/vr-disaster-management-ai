import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/layout/AppShell";

// Login
import Login from "./pages/Login";

// Main pages
import Dashboard from "./pages/Dashboard";
import Simulations from "./pages/Simulations";
import DisasterMap from "./pages/DisasterMap";
import Training from "./pages/Training";
import SkillTwin from "./pages/SkillTwin";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Resources from "./pages/Resources";
import GenericPage from "./pages/GenericPage";
import Messages from "./pages/Messages";
import Help from "./pages/Help";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            LOGIN
            User + Admin both enter through this page
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ==================================================
            MAIN APPLICATION
        ================================================== */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/dashboard"
          element={
            <AppShell>
              <Dashboard />
            </AppShell>
          }
        />

        <Route
          path="/simulations"
          element={
            <AppShell>
              <Simulations />
            </AppShell>
          }
        />

        <Route
          path="/map"
          element={
            <AppShell>
              <DisasterMap />
            </AppShell>
          }
        />

        <Route
          path="/training"
          element={
            <AppShell>
              <Training />
            </AppShell>
          }
        />

        <Route
          path="/skill-twin"
          element={
            <AppShell>
              <SkillTwin />
            </AppShell>
          }
        />

        <Route
          path="/analytics"
          element={
            <AppShell>
              <Analytics />
            </AppShell>
          }
        />

        <Route
          path="/alerts"
          element={
            <AppShell>
              <Alerts />
            </AppShell>
          }
        />

        <Route
          path="/messages"
          element={
            <AppShell>
              <Messages />
            </AppShell>
          }
        />

        <Route
          path="/help"
          element={
            <AppShell>
              <Help />
            </AppShell>
          }
        />

        <Route
          path="/resources"
          element={
            <AppShell>
              <Resources />
            </AppShell>
          }
        />

        {/* ==================================================
            ADMIN
        ================================================== */}

        <Route
          path="/admin"
          element={
            <AppShell>
              <Admin />
            </AppShell>
          }
        />

        {/* ==================================================
            AI ASSISTANT
        ================================================== */}

        <Route
          path="/ai-assistant"
          element={
            <AppShell>
              <GenericPage
                icon="bot"
                title="AI Assistant"
                subtitle="AI-powered disaster intelligence and training guidance."
              />
            </AppShell>
          }
        />

        {/* ==================================================
            SETTINGS
        ================================================== */}

        <Route
          path="/settings"
          element={
            <AppShell>
              <GenericPage
                icon="settings"
                title="Settings"
                subtitle="Manage your dashboard preferences."
              />
            </AppShell>
          }
        />

        {/* ==================================================
            UNKNOWN ROUTE
        ================================================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}