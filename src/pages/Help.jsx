import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";

export default function Help() {
  return (
    <div className="page">
      <SectionTitle
        title="Help & Support"
        subtitle="Get assistance with the disaster management platform."
      />

      <Panel title="Support Center">
        <div className="empty-page">
          <h3>How can we help?</h3>
          <p>
            Documentation, training guides and emergency support
            will be available here.
          </p>
        </div>
      </Panel>
    </div>
  );
}