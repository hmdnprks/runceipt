"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.accessToken) router.push("/dashboard");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#888", fontFamily: "monospace" }}>Loading...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div style={{ textAlign: "center", padding: "48px 40px", maxWidth: "380px" }}>
        <div
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#fff",
            letterSpacing: "0.04em",
            marginBottom: "12px",
          }}
        >
          Runceipt
        </div>
        <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.6", marginBottom: "32px" }}>
          Turn your Strava runs into
          <br />
          beautiful shareable receipts
        </p>
        <div
          style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "36px" }}
        >
          {["5.2 km", "10.4 km", "21.1 km"].map((d) => (
            <div
              key={d}
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "4px",
                padding: "12px 16px",
                width: "80px",
              }}
            >
              <div style={{ color: "#6ee7b7", fontSize: "13px", fontWeight: "700" }}>{d}</div>
              <div
                style={{
                  color: "#444",
                  fontSize: "9px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.15em",
                  marginTop: "2px",
                }}
              >
                run
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => (window.location.href = "/api/auth/login")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FC4C02",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "14px 28px",
            fontSize: "14px",
            fontFamily: "'Courier New', monospace",
            fontWeight: "700",
            cursor: "pointer",
            width: "100%",
            marginBottom: "16px",
          }}
        >
          Connect with Strava
        </button>
        <p style={{ color: "#444", fontSize: "10px" }}>
          Read-only access. We never post on your behalf.
        </p>
      </div>
    </main>
  );
}
