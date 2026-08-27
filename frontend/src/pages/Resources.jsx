import SectionTitle from "../components/common/SectionTitle";
import Resources from "../components/home/Resources";

export default function ResourcesPage() {
  return (
    <div className="page">
      <SectionTitle
        title="Resource Management"
        subtitle="Emergency response resources and availability."
      />

      <Resources />
    </div>
  );
}