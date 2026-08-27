import React from "react";

import {
  Flame,
  CloudRain,
  CloudLightning,
  ShieldCheck,
} from "lucide-react";

import { alerts } from "../../data/dashboard";

const icons = [
  Flame,
  CloudRain,
  CloudLightning,
  ShieldCheck,
];

export default function AlertsPanel() {
  return (
    <div className="panel alerts-panel">
      <div className="panel-head">
        <h2>Active Alerts</h2>

        <button className="text-link">
          View All
        </button>
      </div>

      {alerts.map((alert, index) => {
        const Icon = icons[index];

        return (
          <div
            className={`alert-row ${alert.tone}`}
            key={alert.type}
          >
            <span className="alert-icon">
              <Icon size={19} />
            </span>

            <div>
              <strong>{alert.type}</strong>
              <small>{alert.place}</small>
            </div>

            <div className="alert-meta">
              <strong>{alert.level}</strong>
              <small>{alert.time}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}