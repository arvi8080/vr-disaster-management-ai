export default function DisasterMap() {
  return (
    <div className="large-map">
      <div className="map-world">🌎</div>
      {["a", "b", "c", "d", "e", "f", "g"].map((x) => (
        <i key={x} className={`pin ${x}`} />
      ))}
    </div>
  );
}
