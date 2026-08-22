import { Bot, Settings } from "lucide-react";
import SectionTitle from "../components/common/SectionTitle";

export default function GenericPage({ title, subtitle, icon }) {
  const Icon = icon === "bot" ? Bot : Settings;

  return (
    <div className="page">
      <SectionTitle
        title={title}
        subtitle={subtitle}
      />

      <div className="empty-page">
        <Icon size={54} />
        <h3>{title}</h3>
        <p>This workspace is ready for backend/API integration.</p>
      </div>
    </div>
  );
}