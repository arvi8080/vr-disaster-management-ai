import { skills } from "../../data/dashboard";
export default function SkillProgress() {
  return (
    <div className="skill-progress">
      {Object.entries(skills)
        .filter(([k]) => k !== "overallScore")
        .map(([k, v]) => (
          <div key={k}>
            <span>{k.replace(/[A-Z]/g, (m) => " " + m)}</span>
            <b>{v}%</b>
            <i>
              <em style={{ width: `${v}%` }} />
            </i>
          </div>
        ))}
    </div>
  );
}
