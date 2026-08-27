import React from "react";
import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";
import {
  Activity,
  AlertTriangle,
  Box,
  Radio,
  ShieldAlert,
  Users,
} from "lucide-react";

import "../styles/admin.css";

export default function Admin() {
  return (
    <div className="admin-page">

      {/* =========================================
          3D BACKGROUND ENVIRONMENT
      ========================================== */}

      <div className="admin-3d-background">

        <div className="admin-grid-floor" />

        <div className="admin-glow glow-one" />
        <div className="admin-glow glow-two" />

        {/* Floating particles */}
        <div className="admin-particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        {/* Radar */}
        <div className="admin-radar">

          <div className="radar-ring ring-one" />
          <div className="radar-ring ring-two" />
          <div className="radar-ring ring-three" />

          <div className="radar-cross horizontal" />
          <div className="radar-cross vertical" />

          <div className="radar-sweep" />

          <span className="radar-dot dot-one" />
          <span className="radar-dot dot-two" />
          <span className="radar-dot dot-three" />

        </div>

        {/* 3D Disaster Globe */}
        <div className="admin-globe">

          <div className="globe-inner">
            <div className="globe-line line-one" />
            <div className="globe-line line-two" />
            <div className="globe-line line-three" />

            <span className="hazard-point hp-one" />
            <span className="hazard-point hp-two" />
            <span className="hazard-point hp-three" />
          </div>

        </div>

      </div>

      {/* =========================================
          CONTENT
      ========================================== */}

      <div className="admin-content">

        {/* Header */}

        <div className="admin-command-header">

          <div>
            <div className="admin-system-label">
              <span className="live-dot" />
              DISASTER RESPONSE COMMAND SYSTEM
            </div>

            <SectionTitle
              title="Admin Dashboard"
              subtitle="Manage the disaster management platform."
            />
          </div>

          <div className="admin-live-status">
            <Radio size={16} />
            <span>LIVE MONITORING</span>
          </div>

        </div>

        {/* =====================================
            COMMAND STATUS
        ====================================== */}

        <div className="admin-command-status">

          <div>
            <ShieldAlert size={18} />
            <span>
              <b>SYSTEM STATUS</b>
              All systems operational
            </span>
          </div>

          <div>
            <Activity size={18} />
            <span>
              <b>ACTIVE RESPONSE</b>
              07 incidents monitored
            </span>
          </div>

          <div>
            <Box size={18} />
            <span>
              <b>VR NETWORK</b>
              Training environment online
            </span>
          </div>

        </div>

        {/* =====================================
            STATISTICS
        ====================================== */}

        <div className="analytics-grid admin-stat-grid">

          <AdminStat
            icon={<Users />}
            title="Users"
            value="0"
            description="Registered users"
            status="USER DATABASE"
          />

          <AdminStat
            icon={<Activity />}
            title="Simulations"
            value="02"
            description="Active scenarios"
            status="VR TRAINING"
            danger
          />

          <AdminStat
            icon={<Box />}
            title="Resources"
            value="15"
            description="Resources deployed"
            status="RESOURCE NETWORK"
          />

          <AdminStat
            icon={<AlertTriangle />}
            title="Alerts"
            value="5"
            description="Active alerts"
            status="CRITICAL MONITOR"
            warning
          />

        </div>

        {/* =====================================
            LOWER COMMAND CENTER
        ====================================== */}

        <div className="admin-command-grid">

          <Panel title="Live Disaster Monitoring">

            <div className="monitor-panel">

              <div className="monitor-map">

                <div className="map-grid" />

                <div className="map-radar">

                  <div className="map-radar-ring" />
                  <div className="map-radar-ring ring-small" />

                  <div className="map-scan" />

                  <span className="map-point map-point-one" />
                  <span className="map-point map-point-two" />
                  <span className="map-point map-point-three" />

                </div>

                <div className="map-label label-one">
                  INCIDENT 01
                </div>

                <div className="map-label label-two">
                  HAZARD ZONE
                </div>

              </div>

              <div className="monitor-footer">

                <span>
                  <i />
                  LIVE DATA STREAM
                </span>

                <span>
                  LAT: 19.0760
                </span>

                <span>
                  LON: 72.8777
                </span>

              </div>

            </div>

          </Panel>

          <Panel title="System Activity">

            <div className="system-activity">

              <ActivityItem
                icon={<Radio />}
                title="Simulation started"
                text="Earthquake response scenario"
                time="02 min"
              />

              <ActivityItem
                icon={<Users />}
                title="Trainee connected"
                text="New VR session established"
                time="05 min"
              />

              <ActivityItem
                icon={<AlertTriangle />}
                title="Hazard detected"
                text="Fire zone identified"
                time="08 min"
                warning
              />

              <ActivityItem
                icon={<ShieldAlert />}
                title="AI analysis complete"
                text="Training performance processed"
                time="12 min"
              />

            </div>

          </Panel>

        </div>

      </div>

    </div>
  );
}


/* =========================================
   STAT CARD
========================================= */

function AdminStat({
  icon,
  title,
  value,
  description,
  status,
  danger,
  warning,
}) {
  return (
    <div
      className={`admin-stat-card
        ${danger ? "danger" : ""}
        ${warning ? "warning" : ""}
      `}
    >

      <div className="admin-stat-top">

        <div className="admin-stat-icon">
          {icon}
        </div>

        <span>
          {status}
        </span>

      </div>

      <div className="admin-stat-value">
        {value}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      <div className="stat-line">
        <span />
      </div>

    </div>
  );
}


/* =========================================
   ACTIVITY ITEM
========================================= */

function ActivityItem({
  icon,
  title,
  text,
  time,
  warning,
}) {
  return (
    <div
      className={`activity-item ${
        warning ? "activity-warning" : ""
      }`}
    >

      <div className="activity-icon">
        {icon}
      </div>

      <div className="activity-info">

        <strong>{title}</strong>

        <span>{text}</span>

      </div>

      <time>
        {time}
      </time>

    </div>
  );
}