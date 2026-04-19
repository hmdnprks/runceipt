"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MINT = "#6ee7b7";
const ORANGE = "#FC5200";
const PAPER = "#f4f1ea";
const BG = "#0a0a0b";

const ROUTE_D =
  "M 30 200 C 70 140, 130 120, 180 160 C 240 210, 310 210, 340 150 C 365 100, 320 60, 260 80 C 210 96, 200 160, 260 180 C 330 202, 390 170, 410 110";
const ROUTE_LEN = 780;
const ROUTE_START = { x: 30, y: 200 };
const ROUTE_END = { x: 410, y: 110 };

const RUNS = [
  { km: "5.20", pace: "4'52\"", kcal: 342, elev: 45, hr: 152 },
  { km: "10.40", pace: "5'08\"", kcal: 681, elev: 112, hr: 158 },
  { km: "21.10", pace: "5'24\"", kcal: 1428, elev: 287, hr: 164 },
];

const SPLITS = [70, 85, 60, 92, 78, 88, 72, 95, 66, 80];

// Pre-generated barcode bars (stable across renders)
const BARCODE_BARS: { w: number; gap: boolean }[] = [
  { w: 2, gap: false },
  { w: 1, gap: false },
  { w: 3, gap: true },
  { w: 1, gap: false },
  { w: 2, gap: false },
  { w: 4, gap: false },
  { w: 1, gap: true },
  { w: 2, gap: false },
  { w: 3, gap: false },
  { w: 1, gap: false },
  { w: 2, gap: true },
  { w: 4, gap: false },
  { w: 1, gap: false },
  { w: 2, gap: false },
  { w: 3, gap: false },
  { w: 1, gap: true },
  { w: 2, gap: false },
  { w: 1, gap: false },
  { w: 4, gap: false },
  { w: 2, gap: true },
  { w: 3, gap: false },
  { w: 1, gap: false },
  { w: 2, gap: false },
  { w: 1, gap: true },
  { w: 4, gap: false },
  { w: 2, gap: false },
  { w: 1, gap: false },
  { w: 3, gap: true },
  { w: 1, gap: false },
  { w: 2, gap: false },
  { w: 4, gap: false },
  { w: 1, gap: false },
  { w: 2, gap: true },
  { w: 3, gap: false },
  { w: 1, gap: false },
  { w: 2, gap: false },
  { w: 1, gap: false },
  { w: 4, gap: true },
  { w: 2, gap: false },
  { w: 3, gap: false },
];

function durationFor(km: string, pace: string) {
  const m = parseFloat(pace.split("'")[0]);
  const s = parseFloat(pace.split("'")[1]);
  const totalSec = parseFloat(km) * (m * 60 + s);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = Math.floor(totalSec % 60);
  return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function useRouteAnim() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      setT(((ts - start) / 1000) % 6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

function TornEdge({ flip }: { flip?: boolean }) {
  const points: string[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * 300;
    const y = flip ? (i % 2 ? 0 : 8) : i % 2 ? 8 : 0;
    points.push(`${x},${y}`);
  }
  if (flip) points.push("300,8", "0,8");
  else points.push("300,0", "0,0");
  return (
    <svg
      viewBox="0 0 300 8"
      width="300"
      height="8"
      style={{ display: "block", filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.4))" }}
    >
      <polygon points={points.join(" ")} fill={PAPER} />
    </svg>
  );
}

function Dashed({ double }: { double?: boolean }) {
  return (
    <div
      style={{
        borderTop: double ? "1px dashed rgba(0,0,0,0.5)" : "1px dashed rgba(0,0,0,0.3)",
        borderBottom: double ? "1px dashed rgba(0,0,0,0.5)" : "none",
        height: double ? 3 : 0,
        margin: "2px 0",
      }}
    />
  );
}

function LineItem({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "3px 0",
        fontSize: 11,
        gap: 8,
      }}
    >
      <span style={{ opacity: 0.7, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ fontWeight: 600, color: accent ?? "#1a1a1a", whiteSpace: "nowrap" }}>
        {value}
      </span>
    </div>
  );
}

function Barcode() {
  return (
    <div style={{ display: "flex", gap: 1, height: 36, alignItems: "center" }}>
      {BARCODE_BARS.map((b, i) => (
        <div
          key={i}
          style={{ width: b.w, height: "100%", background: b.gap ? "transparent" : "#1a1a1a" }}
        />
      ))}
    </div>
  );
}

function BackdropMotion({ t }: { t: number }) {
  const dashes = Array.from({ length: 14 }, (_, i) => ({
    x: (i * 37 + t * 30) % 460,
    y: (i * 53 + 50) % 900,
    rot: i * 23,
  }));
  return (
    <svg
      viewBox="0 0 460 900"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <radialGradient id="bgvignette" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="rgba(110,231,183,0.08)" />
          <stop offset="60%" stopColor="rgba(110,231,183,0)" />
        </radialGradient>
      </defs>
      <rect width="460" height="900" fill="url(#bgvignette)" />
      {dashes.map((d, i) => (
        <g key={i} transform={`translate(${d.x},${d.y}) rotate(${d.rot})`} opacity="0.14">
          <line
            x1="-6"
            y1="0"
            x2="6"
            y2="0"
            stroke={MINT}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}

function Receipt({ t }: { t: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [runnerPos, setRunnerPos] = useState({ x: ROUTE_START.x, y: ROUTE_START.y });
  const [pathLen, setPathLen] = useState(ROUTE_LEN);
  const drawProgress = Math.min(1, t / 4);
  const runIdx = Math.floor((t / 2) % RUNS.length);
  const run = RUNS[runIdx];

  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    if (!pathRef.current) return;
    const total = pathRef.current.getTotalLength();
    const pt = pathRef.current.getPointAtLength(Math.min(1, t / 4) * total);
    setRunnerPos({ x: pt.x, y: pt.y });
  }, [t]);

  return (
    <div
      style={{
        position: "relative",
        width: 300,
        margin: "0 auto",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <TornEdge flip />
      <div
        style={{
          background: PAPER,
          color: "#1a1a1a",
          padding: "14px 20px 10px",
          position: "relative",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)",
        }}
      >
        {/* paper grain */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.35,
            backgroundImage: "radial-gradient(rgba(0,0,0,0.35) 0.5px, transparent 0.6px)",
            backgroundSize: "3px 3px",
            mixBlendMode: "multiply",
          }}
        />
        {/* print head sweep */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 40,
            top: `${Math.min(100, (t / 5) * 100)}%`,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
            opacity: t < 5 ? 0.5 : 0,
            pointerEvents: "none",
            transition: "opacity 0.4s",
          }}
        />

        {/* header */}
        <div
          style={{
            textAlign: "center",
            letterSpacing: "0.15em",
            fontSize: 9,
            opacity: 0.7,
            marginBottom: 6,
          }}
        >
          · · · RUNCEIPT · · ·
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            opacity: 0.6,
            marginBottom: 4,
            fontWeight: 500,
          }}
        >
          RECEIPT OF A RUN
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 9,
            opacity: 0.5,
            marginBottom: 8,
            letterSpacing: "0.05em",
          }}
        >
          SUN · 13 APR 2026 · 06:42 AM
        </div>
        <Dashed />

        {/* route map */}
        <div style={{ margin: "8px 0 6px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 8,
              opacity: 0.55,
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            <span>ROUTE</span>
            <span>CENTRAL PARK LOOP</span>
          </div>
          <div
            style={{
              position: "relative",
              background: "#eae5d8",
              borderTop: "1px dashed rgba(0,0,0,0.2)",
              borderBottom: "1px dashed rgba(0,0,0,0.2)",
              padding: "4px 0",
            }}
          >
            <svg
              viewBox="0 0 440 260"
              width="260"
              height="110"
              style={{ display: "block", margin: "0 auto" }}
            >
              <defs>
                <pattern id="mapgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="rgba(0,0,0,0.06)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="440" height="260" fill="url(#mapgrid)" />
              {/* ghost path */}
              <path
                d={ROUTE_D}
                fill="none"
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="2"
                strokeDasharray="2 4"
              />
              {/* drawing path */}
              <path
                ref={pathRef}
                d={ROUTE_D}
                fill="none"
                stroke={MINT}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={pathLen}
                strokeDashoffset={pathLen * (1 - drawProgress)}
                style={{ filter: `drop-shadow(0 0 6px ${MINT}66)` }}
              />
              {/* start pin */}
              <circle cx={ROUTE_START.x} cy={ROUTE_START.y} r="6" fill="#1a1a1a" />
              <circle cx={ROUTE_START.x} cy={ROUTE_START.y} r="2.5" fill={PAPER} />
              {/* finish pulse */}
              {drawProgress >= 1 && (
                <g>
                  <circle cx={ROUTE_END.x} cy={ROUTE_END.y} r="6" fill={MINT} />
                  <circle
                    cx={ROUTE_END.x}
                    cy={ROUTE_END.y}
                    r="12"
                    fill="none"
                    stroke={MINT}
                    strokeWidth="1.5"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      values="6;18;6"
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0;0.8"
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              )}
              {/* runner dot */}
              {drawProgress < 1 && (
                <g transform={`translate(${runnerPos.x},${runnerPos.y})`}>
                  <circle r="8" fill={MINT} opacity="0.25" />
                  <circle r="4.5" fill={MINT} stroke="#1a1a1a" strokeWidth="1.5" />
                </g>
              )}
              {/* km markers */}
              {drawProgress > 0.3 && (
                <text
                  x="190"
                  y="155"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  fill="rgba(0,0,0,0.55)"
                  textAnchor="middle"
                >
                  1K
                </text>
              )}
              {drawProgress > 0.55 && (
                <text
                  x="280"
                  y="55"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  fill="rgba(0,0,0,0.55)"
                  textAnchor="middle"
                >
                  2K
                </text>
              )}
              {drawProgress > 0.8 && (
                <text
                  x="345"
                  y="200"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  fill="rgba(0,0,0,0.55)"
                  textAnchor="middle"
                >
                  3K
                </text>
              )}
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 8,
              opacity: 0.55,
              letterSpacing: "0.1em",
              marginTop: 6,
            }}
          >
            <span>40.785°N</span>
            <span>-73.968°W</span>
          </div>
        </div>
        <Dashed />

        {/* stats */}
        <div style={{ padding: "8px 0 2px", fontSize: 11 }}>
          <LineItem label="DISTANCE" value={`${run.km} km`} accent={MINT} />
          <LineItem label="PACE" value={`${run.pace} /km`} />
          <LineItem label="TIME" value={durationFor(run.km, run.pace)} />
          <LineItem label="ELEV" value={`${run.elev} m`} />
          <LineItem label="KCAL" value={`${run.kcal}`} />
          <LineItem label="HR" value={`${run.hr} bpm`} />
        </div>
        <Dashed />

        {/* pace bars */}
        <div style={{ margin: "6px 0 4px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 8,
              opacity: 0.55,
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            <span>SPLITS</span>
            <span>min / km</span>
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 22 }}>
            {SPLITS.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${t > i * 0.12 + 0.2 ? h : 0}%`,
                  background: i === 7 ? MINT : "#1a1a1a",
                  transition: "height 0.5s cubic-bezier(.3,1.6,.4,1)",
                }}
              />
            ))}
          </div>
        </div>
        <Dashed />

        {/* totals */}
        <div style={{ padding: "6px 0 6px", fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
            <span>TOTAL</span>
            <span>{run.km} km</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              opacity: 0.7,
              marginTop: 2,
            }}
          >
            <span>PAID IN SWEAT</span>
            <span>✓ APPROVED</span>
          </div>
        </div>
        <Dashed double />

        {/* barcode */}
        <div
          style={{
            padding: "6px 0 2px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Barcode />
          <div style={{ fontSize: 8, opacity: 0.6, letterSpacing: "0.3em" }}>
            RCPT · 042026 · 00428
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 9,
            opacity: 0.6,
            marginTop: 4,
            fontStyle: "italic",
          }}
        >
          thank you for running.
        </div>
      </div>
      <TornEdge />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const t = useRouteAnim();

  const dots = Math.floor(t * 3) % 4;
  const ctaPulse = 1 + Math.sin(t * 3) * 0.02;
  const ctaArrowX = Math.sin(t * 4) * 3;
  const shimmerLeft = `${((t * 50) % 160) - 60}%`;

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
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            color: MINT,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.2em",
            opacity: 0.7,
          }}
        >
          LOADING{".".repeat(dots)}
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BackdropMotion t={t} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 360,
          padding: "40px 20px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* live badge */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(110,231,183,0.25)",
              background: "rgba(110,231,183,0.06)",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: MINT,
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: MINT,
                boxShadow: `0 0 8px ${MINT}`,
                animation: "pulseGlow 1.2s infinite",
                flexShrink: 0,
              }}
            />
            Live · printing{".".repeat(dots)}
          </span>
        </div>

        {/* headline */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 42,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: "#fff",
            }}
          >
            Runceipt<span style={{ color: MINT }}>.</span>
          </div>
          <div
            style={{
              fontSize: 12,
              opacity: 0.65,
              marginTop: 12,
              lineHeight: 1.6,
              color: "#fff",
            }}
          >
            Turn your Strava runs into beautiful,
            <br />
            shareable receipts.
          </div>
        </div>

        {/* animated receipt */}
        <Receipt t={t} />

        {/* CTA */}
        <div>
          <button
            onClick={() => (window.location.href = "/api/auth/login")}
            style={{
              width: "100%",
              height: 56,
              border: "none",
              borderRadius: 14,
              background: ORANGE,
              color: "#fff",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.05em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: `0 12px 30px -10px rgba(252,82,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset`,
              transform: `scale(${ctaPulse})`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 60,
                left: shimmerLeft,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>CONNECT YOUR RUNS</span>
            <span
              style={{
                position: "relative",
                zIndex: 1,
                transform: `translateX(${ctaArrowX}px)`,
              }}
            >
              →
            </span>
          </button>
          <p
            style={{
              textAlign: "center",
              fontSize: 9,
              opacity: 0.45,
              marginTop: 10,
              letterSpacing: "0.08em",
              color: "#fff",
            }}
          >
            READ-ONLY ACCESS · WE NEVER POST ON YOUR BEHALF
          </p>
        </div>
      </div>
    </main>
  );
}
