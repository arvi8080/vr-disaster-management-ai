export default function StatCard({ label, value, trend, icon }) {
  return (
    <div className="stat-box">
      <span className="stat-icon">{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        {trend && <small className="trend">↗ {trend}</small>}
      </div>
    </div>
  );
}
