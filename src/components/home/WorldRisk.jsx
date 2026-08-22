import React from "react";
import Panel from "../common/Panel";

export default function WorldRisk() {
  return (
    <Panel title="Global Disaster Overview" action="View Full Map">
      <div className="world-risk">
        <div className="risk-list">
          <div className="risk high">
            <b>12</b>
            <span>High Risk</span>
          </div>

          <div className="risk medium">
            <b>28</b>
            <span>Medium Risk</span>
          </div>

          <div className="risk low">
            <b>36</b>
            <span>Low Risk</span>
          </div>

          <div className="risk clear">
            <b>156</b>
            <span>All Clear</span>
          </div>
        </div>

        <div className="world-map">
          <div className="continents">🌎</div>

          {["one", "two", "three", "four", "five", "six"].map((x) => (
            <i
              key={x}
              className={`pin ${x}`}
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}