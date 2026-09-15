export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden">
      <div
        className="ambient-orb"
        style={{
          top: "-10%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          background: "var(--color-accent)",
          opacity: 0.16,
          animation: "drift-a 22s ease-in-out infinite alternate",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          bottom: "-15%",
          left: "-10%",
          width: "45vw",
          height: "45vw",
          background: "var(--color-accent-warm)",
          opacity: 0.12,
          animation: "drift-b 28s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
