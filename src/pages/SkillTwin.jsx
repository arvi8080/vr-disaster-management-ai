import SectionTitle from "../components/common/SectionTitle";
import Panel from "../components/common/Panel";
import SkillRadar from "../components/skill-twin/SkillRadar";
import SkillProgress from "../components/skill-twin/SkillProgress";
import SkillTwinModel from "../components/skill-twin/SkillTwinModel";
import AIInsight from "../components/skill-twin/AIInsight";
import SkillHistory from "../components/skill-twin/SkillHistory";
export default function SkillTwin() {
  return (
    <div className="page">
      <SectionTitle
        title="Digital Skill Twin"
        subtitle="Your evolving disaster-response capability profile."
      />
      <div className="twin-grid">
        <Panel title="Skill Profile">
          <SkillRadar />
        </Panel>
        <Panel title="AI Profile">
          <SkillTwinModel />
          <AIInsight />
        </Panel>
        <Panel title="Skill Progress">
          <SkillProgress />
        </Panel>
        <Panel title="Performance History">
          <SkillHistory />
        </Panel>
      </div>
    </div>
  );
}
