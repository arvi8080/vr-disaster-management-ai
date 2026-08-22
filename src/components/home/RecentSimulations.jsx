import React from "react";

import Panel from "../common/Panel";
import { simulations } from "../../data/dashboard";

export default function RecentSimulations() {
  return (
    <Panel
      title="Recent Simulations"
      action="View All"
    >
      <div className="simulation-row">
        {simulations.map((simulation) => (
          <article
            className="sim-card"
            key={simulation.title}
          >
            <div className="sim-image">
              {simulation.image}
            </div>

            <strong>{simulation.title}</strong>

            <small>{simulation.place}</small>

            <span
              className={
                simulation.status === "Completed"
                  ? "done"
                  : "progress"
              }
            >
              {simulation.status}
            </span>
          </article>
        ))}
      </div>
    </Panel>
  );
}