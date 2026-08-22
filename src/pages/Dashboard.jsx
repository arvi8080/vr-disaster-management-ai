import React from "react";

import Hero from "../components/home/Hero";
import AlertsPanel from "../components/home/AlertsPanel";
import QuickLinks from "../components/home/QuickLinks";
import WorldRisk from "../components/home/WorldRisk";
import StatsPanel from "../components/home/StatsPanel";
import AIAssistant from "../components/home/AIAssistant";

export default function Dashboard() {
  return (
    <div className="dashboard">

      {/* =========================
          HERO + ALERTS
      ========================== */}
      <div className="dashboard-top">
        <Hero />
        <AlertsPanel />
      </div>

      {/* =========================
          QUICK ACTIONS
      ========================== */}
      <QuickLinks />

      {/* =========================
          RISK + STATISTICS + AI
      ========================== */}
      <div className="dashboard-mid">
        <WorldRisk />
        <StatsPanel />
        <AIAssistant />
      </div>

    </div>
  );
}