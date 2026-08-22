import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";

export default function Messages() {
  return (
    <div className="page">
      <SectionTitle
        title="Messages"
        subtitle="Emergency communication and system messages."
      />

      <Panel title="Inbox">
        <div className="empty-page">
          <h3>No new messages</h3>
          <p>
            Your emergency communication inbox is currently clear.
          </p>
        </div>
      </Panel>
    </div>
  );
}