import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";
import MapView from "../components/map/DisasterMap";

export default function DisasterMap() {
  return (
    <div className="page">
      <SectionTitle
        title="Disaster Map"
        subtitle="Global incident monitoring and emergency resource visibility."
      />

      <div className="map-layout">
        <Panel title="Live Global Risk">
          <MapView />
        </Panel>

        <Panel title="Incident Summary">
          <div className="incident-list">
            <div>
              <b>12</b>
              <span>High risk zones</span>
            </div>

            <div>
              <b>28</b>
              <span>Medium risk zones</span>
            </div>

            <div>
              <b>156</b>
              <span>All clear regions</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}