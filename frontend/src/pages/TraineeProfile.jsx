import React from "react";
import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";
import {
  User,
  Shield,
  Award,
  BookOpen,
  Activity,
  CheckCircle,
  Clock,
  Target,
  Brain,
  Sparkles,
  ChevronRight,
  Flame,
  Droplets,
  Zap
} from "lucide-react";

export default function TraineeProfile() {
  const trainee = {
    name: "Alex Vance",
    role: "Senior Rescue Operative",
    unit: "Urban Search & Rescue (USAR - Unit 04)",
    id: "TR-8902-X",
    readinessScore: 94,
    totalSimulations: 28,
    hoursTrained: "42.5 hrs",
    certifications: [
      { id: 1, title: "Urban Search & Rescue Specialist", level: "Tier III", date: "Aug 2026", status: "Active", icon: Shield },
      { id: 2, title: "Structural Fire Mitigation", level: "Tier II", date: "Jul 2026", status: "Active", icon: Flame },
      { id: 3, title: "Flood Evacuation Tactics", level: "Tier II", date: "Jun 2026", status: "Active", icon: Droplets },
      { id: 4, title: "Hazmat & Chemical Suppression", level: "Tier I", date: "May 2026", status: "Active", icon: Zap }
    ],
    assignedModules: [
      { id: 101, name: "Earthquake Collapse Survival", category: "Seismic Disaster", progress: 100, score: "96%", status: "Completed" },
      { id: 102, name: "Industrial Fire Extinguishment", category: "Fire Safety", progress: 85, score: "88%", status: "In Progress" },
      { id: 103, name: "Coastal Tsunami Evacuation", category: "Flood Response", progress: 40, score: "Pending", status: "In Progress" },
      { id: 104, name: "Chemical Facility Leak Containment", category: "Hazmat", progress: 0, score: "Not Started", status: "Assigned" }
    ]
  };

  return (
    <div className="page trainee-profile-page">
      <SectionTitle
        title="Trainee Profile & Credentials"
        subtitle="Individual operative performance records, skill twin metrics, and certifications."
      />

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px" }}>
        
        {/* =========================================
            LEFT COLUMN: IDENTITY & READINESS CARD
        ========================================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <Panel title="Operative Credentials">
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlignment: "center" }}>
              <div style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6946ff, #31d6ff)",
                display: "grid",
                placeItems: "center",
                fontSize: "32px",
                fontWeight: 800,
                color: "#fff",
                boxShadow: "0 0 30px rgba(105, 70, 255, 0.4)",
                border: "3px solid rgba(255, 255, 255, 0.2)",
                marginBottom: "14px"
              }}>
                AV
              </div>

              <h2 style={{ fontSize: "20px", margin: "0 0 4px", color: "#f4f7ff" }}>{trainee.name}</h2>
              <span style={{ fontSize: "12px", color: "#31d6ff", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "8px" }}>
                {trainee.role}
              </span>
              <span style={{ fontSize: "11px", color: "var(--muted, #8d9ab3)", background: "rgba(148, 163, 184, 0.08)", padding: "4px 10px", borderRadius: "20px" }}>
                ID: {trainee.id}
              </span>

              <div style={{ width: "100%", height: "1px", background: "var(--line, rgba(148, 163, 184, 0.12))", margin: "18px 0" }} />

              {/* Stats Summary */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "var(--muted, #8d9ab3)" }}>Specialization:</span>
                  <span style={{ fontWeight: 600, color: "#f4f7ff" }}>USAR Unit 04</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "var(--muted, #8d9ab3)" }}>Simulations Completed:</span>
                  <span style={{ fontWeight: 600, color: "#f4f7ff" }}>{trainee.totalSimulations}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "var(--muted, #8d9ab3)" }}>Total VR Training Time:</span>
                  <span style={{ fontWeight: 600, color: "#f4f7ff" }}>{trainee.hoursTrained}</span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Readiness Score Card */}
          <Panel title="Mission Readiness Score">
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                position: "relative",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "conic-gradient(#36d98a 0% 94%, rgba(148, 163, 184, 0.15) 94% 100%)",
                display: "grid",
                placeItems: "center",
                marginBottom: "12px"
              }}>
                <div style={{
                  width: "94px",
                  height: "94px",
                  borderRadius: "50%",
                  background: "#0a1222",
                  display: "grid",
                  placeItems: "center"
                }}>
                  <span style={{ fontSize: "28px", fontWeight: 800, color: "#36d98a" }}>94%</span>
                </div>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#36d98a", letterSpacing: "0.08em" }}>
                EXCEPTIONAL READINESS LEVEL
              </span>
              <p style={{ fontSize: "11px", color: "var(--muted, #8d9ab3)", textAlign: "center", margin: "6px 0 0" }}>
                Qualified for tier-1 live emergency deployment and complex VR disaster simulations.
              </p>
            </div>
          </Panel>

        </div>

        {/* =========================================
            RIGHT COLUMN: CERTIFICATIONS & VR MODULES
        ========================================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Active Certifications */}
          <Panel title="Earned Certifications & Badges">
            <div style={{ padding: "18px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
              {trainee.certifications.map((cert) => {
                const IconComponent = cert.icon;
                return (
                  <div
                    key={cert.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px",
                      background: "linear-gradient(135deg, rgba(15, 27, 48, 0.8), rgba(7, 14, 27, 0.9))",
                      border: "1px solid var(--line, rgba(148, 163, 184, 0.12))",
                      borderRadius: "14px"
                    }}
                  >
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "rgba(105, 70, 255, 0.15)",
                      border: "1px solid rgba(105, 70, 255, 0.3)",
                      display: "grid",
                      placeItems: "center",
                      color: "#8b5cf6"
                    }}>
                      <IconComponent size={22} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#31d6ff" }}>{cert.level}</span>
                        <span style={{ fontSize: "9px", color: "#36d98a", background: "rgba(54, 217, 138, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>{cert.status}</span>
                      </div>
                      <h4 style={{ fontSize: "13px", margin: "3px 0 2px", color: "#f4f7ff" }}>{cert.title}</h4>
                      <span style={{ fontSize: "10px", color: "var(--muted, #8d9ab3)" }}>Issued: {cert.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Assigned & Active VR Modules */}
          <Panel title="Assigned Training Modules">
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {trainee.assignedModules.map((module) => (
                <div
                  key={module.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: "rgba(13, 23, 41, 0.6)",
                    border: "1px solid rgba(148, 163, 184, 0.08)",
                    borderRadius: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "rgba(49, 214, 255, 0.1)",
                      border: "1px solid rgba(49, 214, 255, 0.2)",
                      display: "grid",
                      placeItems: "center",
                      color: "#31d6ff"
                    }}>
                      <BookOpen size={18} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "14px", margin: "0 0 2px", color: "#f4f7ff" }}>{module.name}</h4>
                      <span style={{ fontSize: "11px", color: "var(--muted, #8d9ab3)" }}>Category: {module.category}</span>

                      {/* Progress Bar */}
                      <div style={{ width: "100%", maxWidth: "220px", height: "4px", background: "rgba(148, 163, 184, 0.15)", borderRadius: "2px", marginTop: "6px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${module.progress}%`,
                          background: module.progress === 100 ? "#36d98a" : "linear-gradient(90deg, #6946ff, #31d6ff)",
                          borderRadius: "2px"
                        }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#f4f7ff", display: "block" }}>{module.score}</span>
                      <span style={{ fontSize: "10px", color: module.status === "Completed" ? "#36d98a" : "#ff9d2e" }}>{module.status}</span>
                    </div>

                    <button style={{
                      background: "rgba(105, 70, 255, 0.15)",
                      border: "1px solid rgba(105, 70, 255, 0.3)",
                      color: "#8b5cf6",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}>
                      Launch VR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

        </div>

      </div>
    </div>
  );
}
