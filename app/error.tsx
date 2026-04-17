"use client";

import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={s.root}>
      <AlertCircle size={40} color="#ff6b6b" strokeWidth={1.5} />
      <h2 style={s.title}>Something went wrong</h2>
      <p style={s.message}>{error.message || "An unexpected error occurred"}</p>
      <button onClick={reset} style={s.btn}>
        Try again
      </button>
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
    fontFamily: "'Courier New', monospace",
    gap: "12px",
  },
  title: { color: "#fff", fontSize: "18px", fontWeight: "700" },
  message: { color: "#888", fontSize: "12px", maxWidth: "400px", textAlign: "center" },
  btn: {
    background: "none",
    border: "1px solid #333",
    color: "#888",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    fontSize: "12px",
    marginTop: "8px",
  },
};
