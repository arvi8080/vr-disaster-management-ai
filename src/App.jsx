import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/layout/AppShell";

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
      <AppShell>
        <Routes>
          {/* Dashboard */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* VR & Disaster */}
          <Route
            path="/simulations"
            element={<Simulations />}
          />

          <Route
            path="/map"
            element={<DisasterMap />}
          />

          <Route
            path="/training"
            element={<Training />}
          />

          {/* Intelligence */}
          <Route
            path="/skill-twin"
            element={<SkillTwin />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/alerts"
            element={<Alerts />}
          />
          <Route path="/messages" element={<Messages />} />

<Route path="/help" element={<Help />} />

<Route path="/admin" element={<Admin />} />

          <Route
            path="/resources"
            element={<Resources />}
          />

          {/* AI Assistant */}
          <Route
            path="/ai-assistant"
            element={
              <GenericPage
                icon="bot"
                title="AI Assistant"
                subtitle="AI-powered disaster intelligence and training guidance."
              />
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <GenericPage
                icon="settings"
                title="Settings"
                subtitle="Manage your dashboard preferences."
              />
            }
          />

          {/* Unknown route */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}