import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/layout/AppShell";

// Login & Register
import Login from "./pages/Login";
import Register from "./pages/Register";

// Main pages
import Dashboard from "./pages/Dashboard";
import Simulations from "./pages/Simulations";
import DisasterMap from "./pages/DisasterMap";
import Training from "./pages/Training";
import TrainingHistory from "./pages/TrainingHistory";
import SkillTwin from "./pages/SkillTwin";
import TraineeProfile from "./pages/TraineeProfile";
import TrainerDashboard from "./pages/TrainerDashboard";
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
            AUTH ROUTES
        ================================================== */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==================================================
            MAIN APPLICATION
        ================================================== */}

        <Route path="/" element={<Navigate to="/login" replace />} />

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
          path="/training-history"
          element={
            <AppShell>
              <TrainingHistory />
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
          path="/trainee-profile"
          element={
            <AppShell>
              <TraineeProfile />
            </AppShell>
          }
        />

        <Route
          path="/trainer-dashboard"
          element={
            <AppShell>
              <TrainerDashboard />
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

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}