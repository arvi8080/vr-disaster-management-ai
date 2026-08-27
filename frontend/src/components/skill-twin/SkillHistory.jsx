export default function SkillHistory() {
  return (
    <div className="history-bars">
      {[42, 55, 49, 68, 62, 78, 83, 86, 91].map((v, i) => (
        <i key={i} style={{ height: `${v}%` }} />
      ))}
    </div>
  );
}
