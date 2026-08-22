import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";
import { skills } from "../data/dashboard";

export default function Analytics() {
  return (
    <div className="page">
      <SectionTitle
        title="Analytics & Reports"
        subtitle="Track training performance, risk and response outcomes."
      />

      <div className="analytics-grid">
        <Panel title="Performance Trend">
          <div className="big-chart">
            {[45, 54, 51, 68, 62, 72, 69, 82, 79, 91, 86, 94].map(
              (v, i) => (
                <i
                  key={i}
                  style={{ height: `${v}%` }}
                />
              )
            )}
          </div>
        </Panel>

        <Panel title="Key Metrics">
          <div className="metric-list">
            <div>
              <span>Average Score</span>
              <b>{skills.overallScore}%</b>
            </div>

            <div>
              <span>Training Sessions</span>
              <b>0</b>
            </div>

            <div>
              <span>Lives Saved</span>
              <b>0</b>
            </div>

            <div>
              <span>Safety Rating</span>
              <b>0%</b>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}