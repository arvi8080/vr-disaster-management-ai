import { skills } from "../../data/dashboard";
export default function SkillRadar() {
  const vals = [
    skills.situationalAwareness,
    skills.decisionMaking,
    skills.communication,
    skills.teamwork,
    skills.emergencyResponse,
    skills.safetyAwareness,
  ];
  return (
    <div className="radar-wrap">
      <div className="radar-grid">
        <div className="radar-shape" />
      </div>
      <div className="radar-labels">
        <span>Awareness</span>
        <span>Decision</span>
        <span>Communication</span>
        <span>Teamwork</span>
        <span>Response</span>
        <span>Safety</span>
      </div>
      <div className="radar-score">
        {Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)}
        <small>AVG</small>
      </div>
    </div>
  );
}
