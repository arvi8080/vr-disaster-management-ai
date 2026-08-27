import React from "react";

import Panel from "../common/Panel";
import { resources } from "../../data/dashboard";

export default function Resources() {
  return (
    <Panel
      title="Resource Availability"
      action="View All"
    >
      <div className="resource-grid">
        {resources.map(([name, value, icon]) => (
          <div
            className="resource"
            key={name}
          >
            <span>{icon}</span>

            <small>{name}</small>

            <b>{value}</b>

            <em>Available</em>
          </div>
        ))}
      </div>
    </Panel>
  );
}