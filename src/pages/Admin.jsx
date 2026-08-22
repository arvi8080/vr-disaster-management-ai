import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";

export default function Admin() {
  return (
    <div className="page">
      <SectionTitle
        title="Admin Dashboard"
        subtitle="Manage the disaster management platform."
      />

      <div className="analytics-grid">

        <Panel title="Users">
          <h2>0</h2>
          <p>Registered users</p>
        </Panel>

        <Panel title="Simulations">
          <h2>02</h2>
          <p>Active scenarios</p>
        </Panel>

        <Panel title="Resources">
          <h2>15</h2>
          <p>Resources deployed</p>
        </Panel>

        <Panel title="Alerts">
          <h2>5</h2>
          <p>Active alerts</p>
        </Panel>

      </div>
    </div>
  );
}