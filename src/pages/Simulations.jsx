import SectionTitle from "../components/common/SectionTitle";
import { simulations } from "../data/dashboard";

export default function Simulations() {
  return (
    <div className="page">
      <SectionTitle
        title="VR Simulations"
        subtitle="Practice high-pressure disaster scenarios in an immersive training environment."
      />

      <div className="filter-row">
        <button className="filter active">All Scenarios</button>
        <button className="filter">Earthquake</button>
        <button className="filter">Flood</button>
        <button className="filter">Wildfire</button>
        <button className="filter">Cyclone</button>
      </div>

      <div className="scenario-grid">
        {simulations.map((s, i) => (
          <article className="scenario-card" key={s.title}>
            <div className="scenario-art">
              {s.image}
              <span>SCENARIO 0{i + 1}</span>
            </div>

            <div>
              <small>{s.place}</small>

              <h3>{s.title}</h3>

              <p>
                Immersive response mission with live objectives, hazards and
                performance tracking.
              </p>

              <button className="glow-btn">
                Start Simulation →
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}