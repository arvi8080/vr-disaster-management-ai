import SectionTitle from "../components/common/SectionTitle";
import DisasterScene from "../components/3d/DisasterScene";
import TrainingHUD from "../components/training/TrainingHUD";
import ObjectivePanel from "../components/training/ObjectivePanel";
import TelemetryFeed from "../components/training/TelemetryFeed";
export default function Training() {
  return (
    <div className="page">
      <SectionTitle
        title="Training Center"
        subtitle="Live simulation workspace."
      />
      <div className="training-screen">
        <DisasterScene />
        <TrainingHUD />
        <ObjectivePanel />
        <TelemetryFeed />
      </div>
    </div>
  );
}
