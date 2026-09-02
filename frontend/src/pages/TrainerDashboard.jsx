import React, { useState } from "react";
import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";
import {
  Users,
  Activity,
  Award,
  Send,
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Radio,
  Eye,
  Brain,
  Sliders
} from "lucide-react";

export default function TrainerDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const trainees = [
    { id: 1, name: "Alex Vance", unit: "USAR Unit 04", scenario: "Earthquake Survival", progress: 95, score: "94%", status: "Active VR Session", readiness: "Tier I" },
    { id: 2, name: "Maria Garcia", unit: "Fire Medical 02", scenario: "Building Fire Evacuation", progress: 88, score: "91%", status: "Active VR Session", readiness: "Tier I" },
    { id: 3, name: "Devon Chen", unit: "Hazmat Rapid Response", scenario: "Chemical Leak Containment", progress: 60, score: "82%", status: "Evaluation Pending", readiness: "Tier II" },
    { id: 4, name: "Sarah Jenkins", unit: "Maritime Flood Relief", scenario: "Coastal Tsunami Evacuation", progress: 100, score: "96%", status: "Completed", readiness: "Tier I" },
    { id: 5, name: "James Miller", unit: "USAR Unit 01", scenario: "Subway Collapse Response", progress: 20, score: "Pending", status: "Active VR Session", readiness: "Tier III" },
  ];

  const filteredTrainees = trainees.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page trainer-dashboard-page">
      <SectionTitle
        title="Instructor & Trainer Command Center"
        subtitle="Manage active trainees, deploy custom VR disaster scenarios, and monitor live performance telemetry."
      />

      {/* =========================================
          TOP STATS SUMMARY CARDS
      ========================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px", marginBottom: "22px" }}>
        <div style={{ padding: "20px", background: "linear-gradient(145deg, rgba(15, 27, 48, 0.9), rgba(7, 14, 27, 0.95))", border: "1px solid var(--line, rgba(148, 163, 184, 0.12))", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--muted, #8d9ab3)", textTransform: "uppercase" }}>ACTIVE TRAINEES</span>
            <Users size={20} color="#31d6ff" />
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#f4f7ff", marginTop: "8px" }}>24</div>
          <span style={{ fontSize: "11px", color: "#36d98a" }}>+4 new this week</span>
        </div>

        <div style={{ padding: "20px", background: "linear-gradient(145deg, rgba(15, 27, 48, 0.9), rgba(7, 14, 27, 0.95))", border: "1px solid var(--line, rgba(148, 163, 184, 0.12))", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--muted, #8d9ab3)", textTransform: "uppercase" }}>LIVE VR SESSIONS</span>
            <Radio size={20} color="#36d98a" />
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#f4f7ff", marginTop: "8px" }}>06</div>
          <span style={{ fontSize: "11px", color: "#36d98a" }}>Live Telemetry Active</span>
        </div>

        <div style={{ padding: "20px", background: "linear-gradient(145deg, rgba(15, 27, 48, 0.9), rgba(7, 14, 27, 0.95))", border: "1px solid var(--line, rgba(148, 163, 184, 0.12))", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--muted, #8d9ab3)", textTransform: "uppercase" }}>AVG READINESS SCORE</span>
            <Award size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#f4f7ff", marginTop: "8px" }}>89.4%</div>
          <span style={{ fontSize: "11px", color: "#8b5cf6" }}>Top 10% Industry Benchmark</span>
        </div>

        <div style={{ padding: "20px", background: "linear-gradient(145deg, rgba(15, 27, 48, 0.9), rgba(7, 14, 27, 0.95))", border: "1px solid var(--line, rgba(148, 163, 184, 0.12))", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--muted, #8d9ab3)", textTransform: "uppercase" }}>PENDING EVALUATIONS</span>
            <Activity size={20} color="#ff9d2e" />
          </div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#f4f7ff", marginTop: "8px" }}>03</div>
          <span style={{ fontSize: "11px", color: "#ff9d2e" }}>Requires instructor review</span>
        </div>
      </div>

      {/* =========================================
          TRAINEE MANAGEMENT ROSTER & CONTROLS
      ========================================== */}
      <Panel title="Trainee Monitoring Roster & Scenario Assignment">
        <div style={{ padding: "20px" }}>
          
          {/* Filter Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(11, 20, 36, 0.9)", border: "1px solid var(--line, rgba(148, 163, 184, 0.12))", padding: "8px 14px", borderRadius: "10px", width: "320px" }}>
              <Search size={16} color="#71809a" />
              <input
                type="text"
                placeholder="Search trainee name or unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: "transparent", border: 0, outline: 0, color: "#fff", fontSize: "12px", width: "100%" }}
              />
            </div>

            <button style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(100deg, #384dff, #7a39ff)",
              border: 0,
              color: "#fff",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(92, 55, 255, 0.3)"
            }}>
              <PlusCircle size={16} />
              <span>Deploy Custom Scenario</span>
            </button>
          </div>

          {/* Roster Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line, rgba(148, 163, 184, 0.12))", color: "var(--muted, #8d9ab3)", fontSize: "11px", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 14px" }}>Trainee Operative</th>
                  <th style={{ padding: "12px 14px" }}>Unit / Specialization</th>
                  <th style={{ padding: "12px 14px" }}>Active Scenario</th>
                  <th style={{ padding: "12px 14px" }}>Progress</th>
                  <th style={{ padding: "12px 14px" }}>Score</th>
                  <th style={{ padding: "12px 14px" }}>Status</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainees.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.07)", transition: "background 0.2s ease" }}>
                    <td style={{ padding: "14px", fontWeight: 700, color: "#f4f7ff" }}>{item.name}</td>
                    <td style={{ padding: "14px", color: "var(--muted, #8d9ab3)" }}>{item.unit}</td>
                    <td style={{ padding: "14px", color: "#31d6ff" }}>{item.scenario}</td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "80px", height: "5px", background: "rgba(148, 163, 184, 0.15)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${item.progress}%`, height: "100%", background: "#31d6ff", borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--muted, #8d9ab3)" }}>{item.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: "#36d98a" }}>{item.score}</td>
                    <td style={{ padding: "14px" }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: item.status.includes("Active") ? "rgba(54, 217, 138, 0.1)" : "rgba(255, 157, 46, 0.1)",
                        color: item.status.includes("Active") ? "#36d98a" : "#ff9d2e"
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button title="View Live Telemetry" style={{ background: "rgba(49, 214, 255, 0.1)", border: "1px solid rgba(49, 214, 255, 0.25)", color: "#31d6ff", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Eye size={14} /> Telemetry
                        </button>
                        <button title="View Skill Twin" style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.25)", color: "#8b5cf6", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Brain size={14} /> Twin
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </Panel>
    </div>
  );
}
