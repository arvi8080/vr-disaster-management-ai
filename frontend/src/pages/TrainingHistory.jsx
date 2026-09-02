import React, { useState } from "react";
import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";
import {
  History,
  Flame,
  Droplets,
  Zap,
  Activity,
  Award,
  Clock,
  CheckCircle,
  FileText,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from "lucide-react";

export default function TrainingHistory() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedSession, setExpandedSession] = useState(null);

  const historyLogs = [
    {
      id: "SIM-2026-0814-A",
      scenario: "Earthquake Structural Collapse",
      category: "Seismic",
      date: "Aug 14, 2026 • 14:22 UTC",
      duration: "14 min 32 sec",
      score: 96,
      rating: "EXCELLENT",
      icon: Activity,
      decisions: [
        { title: "Initial Structural Hazard Assessment", result: "Completed in 45s", status: "Optimal" },
        { title: "Victom Search using Thermal Sensor", result: "3 Casualties Extracted", status: "Optimal" },
        { title: "Gas Line Leak Shutoff Protocol", result: "Executed Before Ignition", status: "Critical Success" },
        { title: "Team Evacuation Route Selection", result: "Zero Incurred Injuries", status: "Optimal" }
      ],
      aiNotes: "Demonstrated exceptional reaction speed under 7.2 M Richter shaking simulation. Hazard avoidance efficiency was 98.4%."
    },
    {
      id: "SIM-2026-0810-B",
      scenario: "Industrial Chemical Spill & Fire",
      category: "Fire & Hazmat",
      date: "Aug 10, 2026 • 09:15 UTC",
      duration: "18 min 05 sec",
      score: 88,
      rating: "PASSED",
      icon: Flame,
      decisions: [
        { title: "Hazmat Suit Verification", result: "Completed", status: "Optimal" },
        { title: "Containment Foam Deployment", result: "Delayed 1m 20s", status: "Minor Delay" },
        { title: "Ventilation Valve Neutralization", result: "Successful", status: "Optimal" }
      ],
      aiNotes: "Chemical isolation sequence executed correctly. Foam deployment response time can be improved by 15%."
    },
    {
      id: "SIM-2026-0804-C",
      scenario: "Coastal Tsunami Rapid Evacuation",
      category: "Flood",
      date: "Aug 04, 2026 • 16:40 UTC",
      duration: "22 min 10 sec",
      score: 92,
      rating: "EXCELLENT",
      icon: Droplets,
      decisions: [
        { title: "High-Ground Route Pathfinding", result: "Selected Optimal Elevation", status: "Optimal" },
        { title: "Civilian Alert Broadcast", result: "Dispatched in 30s", status: "Critical Success" },
        { title: "Flood Barrier Deployment", result: "Completed", status: "Optimal" }
      ],
      aiNotes: "Civilian guidance and high-ground routing achieved 100% evacuation rate before wave crest."
    }
  ];

  const filteredLogs = activeCategory === "All"
    ? historyLogs
    : historyLogs.filter((log) => log.category.includes(activeCategory));

  return (
    <div className="page training-history-page">
      <SectionTitle
        title="VR Simulation Training History & Telemetry Logs"
        subtitle="Review past disaster simulation performance, decision timelines, and AI evaluation archives."
      />

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["All", "Seismic", "Fire & Hazmat", "Flood"].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: activeCategory === category ? "#6946ff" : "rgba(13, 23, 41, 0.7)",
              border: `1px solid ${activeCategory === category ? "#8b5cf6" : "rgba(148, 163, 184, 0.12)"}`,
              color: activeCategory === category ? "#fff" : "var(--muted, #8d9ab3)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* History Session Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredLogs.map((log) => {
          const IconComp = log.icon;
          const isExpanded = expandedSession === log.id;

          return (
            <Panel key={log.id}>
              <div style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
                  
                  {/* Left Title Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(49, 214, 255, 0.1)",
                      border: "1px solid rgba(49, 214, 255, 0.25)",
                      display: "grid",
                      placeItems: "center",
                      color: "#31d6ff"
                    }}>
                      <IconComp size={22} />
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h3 style={{ fontSize: "16px", margin: 0, color: "#f4f7ff" }}>{log.scenario}</h3>
                        <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(148, 163, 184, 0.1)", color: "#31d6ff", padding: "2px 8px", borderRadius: "4px" }}>
                          {log.id}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--muted, #8d9ab3)", display: "block", marginTop: "4px" }}>
                        {log.date} • Duration: {log.duration}
                      </span>
                    </div>
                  </div>

                  {/* Right Score & Accordion Toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "20px", fontWeight: 800, color: "#36d98a", display: "block", lineHeight: 1 }}>
                        {log.score} <span style={{ fontSize: "12px", color: "var(--muted, #8d9ab3)" }}>/ 100</span>
                      </span>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#36d98a", letterSpacing: "0.08em" }}>
                        {log.rating}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : log.id)}
                      style={{
                        background: "rgba(105, 70, 255, 0.15)",
                        border: "1px solid rgba(105, 70, 255, 0.3)",
                        color: "#8b5cf6",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <span>{isExpanded ? "Hide Details" : "View Breakdown"}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                </div>

                {/* Expanded Session Telemetry Details */}
                {isExpanded && (
                  <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid var(--line, rgba(148, 163, 184, 0.12))", display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    {/* Decisions Timeline */}
                    <div>
                      <h4 style={{ fontSize: "13px", color: "#31d6ff", margin: "0 0 10px", letterSpacing: "0.05em" }}>OPERATIVE DECISION BREAKDOWN</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                        {log.decisions.map((dec, idx) => (
                          <div key={idx} style={{ padding: "10px 14px", background: "rgba(13, 23, 41, 0.7)", border: "1px solid rgba(148, 163, 184, 0.08)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <span style={{ fontSize: "12px", color: "#f4f7ff", fontWeight: 600, display: "block" }}>{dec.title}</span>
                              <span style={{ fontSize: "10px", color: "var(--muted, #8d9ab3)" }}>{dec.result}</span>
                            </div>
                            <span style={{ fontSize: "10px", color: dec.status.includes("Optimal") || dec.status.includes("Success") ? "#36d98a" : "#ff9d2e", fontWeight: 700 }}>
                              {dec.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Notes */}
                    <div style={{ padding: "12px 16px", background: "rgba(105, 70, 255, 0.1)", border: "1px solid rgba(105, 70, 255, 0.25)", borderRadius: "10px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#8b5cf6", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>
                        AI EVALUATION SUMMARY
                      </span>
                      <p style={{ fontSize: "12px", color: "#f4f7ff", margin: 0, lineHeight: 1.5 }}>
                        {log.aiNotes}
                      </p>
                    </div>

                  </div>
                )}

              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
