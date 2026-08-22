export default function GlowButton({ children, ...p }) {
  return (
    <button className="glow-btn" {...p}>
      {children}
    </button>
  );
}
