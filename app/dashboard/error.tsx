"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={s.root}>
      <AlertTriangle size={40} color="#ff6b6b" strokeWidth={1.5} />
      <h2 style={s.title}>Failed to load your runs</h2>
      <p style={s.message}>{error.message || "Something went wrong loading the dashboard"}</p>
      <div style={s.actions}>
        <button onClick={reset} style={s.btn}>
          Try again
        </button>
        <button onClick={() => (window.location.href = "/")} style={s.btnSecondary}>
          <ArrowLeft size={11} strokeWidth={1.5} />
          Back to home
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#111",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
    gap: "12px",
  },
  title: { color: "#fff", fontSize: "18px", fontWeight: "700" },
  message: { color: "#888", fontSize: "12px", maxWidth: "400px", textAlign: "center" },
  actions: { display: "flex", gap: "12px", marginTop: "8px" },
  btn: {
    background: "#6ee7b7",
    color: "#111",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: "700",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "1px solid #333",
    color: "#888",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
  },
};
