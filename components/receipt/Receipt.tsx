import type { ProcessedRun, ModuleId, ReceiptTheme } from "@/types/strava";
import RouteSVG from "./RouteSVG";
import PaceChart from "./PaceChart";
import ElevationProfile from "./ElevationProfile";
import HRZones from "./HRZones";
import SplitsTable from "./SplitsTable";

interface Props {
  run: ProcessedRun;
  enabled: Record<ModuleId, boolean>;
  theme: ReceiptTheme;
  quote: string;
}

export default function Receipt({ run, enabled, theme: t, quote }: Props) {
  const monoStyle: React.CSSProperties = {
    fontFamily: t.font === "serif" ? "'Georgia', serif" : "'Courier New', 'Courier', monospace",
  };

  return (
    <div
      style={{
        background: t.bg,
        color: t.text,
        ...monoStyle,
        fontSize: "11px",
        width: "320px",
        padding: "28px 24px 20px",
        boxShadow: "0 4px 40px rgba(0,0,0,0.2)",
        borderRadius: "4px 4px 0 0",
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "8px",
            letterSpacing: "0.22em",
            opacity: 0.4,
            marginBottom: "4px",
            textTransform: "uppercase",
          }}
        >
          Runceipt · via Strava
        </div>
        <div
          style={{
            fontSize: "17px",
            fontWeight: "bold",
            letterSpacing: "0.03em",
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {run.name}
          {enabled.pr_badge && run.isPR && <span style={{ fontSize: "14px" }}>🏅</span>}
        </div>
        <div style={{ fontSize: "9px", opacity: 0.4, letterSpacing: "0.12em" }}>{run.date}</div>
      </div>

      <Divider color={t.text} />

      {/* ── Route Map ──────────────────────────────────────── */}
      {enabled.route && (
        <>
          <SectionLabel color={t.text}>Route</SectionLabel>
          <RouteSVG polyline={run.summaryPolyline} theme={t} />
          <Divider color={t.text} />
        </>
      )}

      {/* ── Key Stats ──────────────────────────────────────── */}
      {enabled.stats && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "4px",
            }}
          >
            {[
              ["Distance", run.distance],
              ["Duration", run.duration],
              ["Avg Pace", run.avgPace],
              ["Calories", run.calories ? `${run.calories} kcal` : "—"],
              ["Elevation", run.elevation],
              ["Cadence", run.cadence ? `${run.cadence} spm` : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "8px",
                    opacity: 0.4,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: t.accent,
                    letterSpacing: "0.02em",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
          <Divider color={t.text} />
        </>
      )}

      {/* ── Pace Chart ─────────────────────────────────────── */}
      {enabled.pace_chart && run.splits && run.splits.length > 0 && (
        <>
          <SectionLabel color={t.text}>Pace by km</SectionLabel>
          <PaceChart splits={run.splits} theme={t} />
          <Divider color={t.text} />
        </>
      )}

      {/* ── Elevation Profile ──────────────────────────────── */}
      {enabled.elevation && run.elevationProfile && run.elevationProfile.length > 0 && (
        <>
          <SectionLabel color={t.text}>Elevation Profile</SectionLabel>
          <ElevationProfile data={run.elevationProfile} theme={t} />
          <Divider color={t.text} />
        </>
      )}

      {/* ── HR Zones ───────────────────────────────────────── */}
      {enabled.hr_zones && run.hrZones && run.hrZones.length > 0 && (
        <>
          <SectionLabel color={t.text}>Heart Rate Zones</SectionLabel>
          <HRZones zones={run.hrZones} theme={t} />
          <Divider color={t.text} />
        </>
      )}

      {/* ── Splits Table ───────────────────────────────────── */}
      {enabled.splits && run.splits && run.splits.length > 0 && (
        <>
          <SectionLabel color={t.text}>Splits</SectionLabel>
          <SplitsTable splits={run.splits} theme={t} />
          <Divider color={t.text} />
        </>
      )}

      {/* ── Weather + HR summary ───────────────────────────── */}
      {(enabled.weather || enabled.stats) && (run.avgHR || run.maxHR) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            opacity: 0.6,
            marginBottom: "8px",
          }}
        >
          {enabled.weather && <span>📍 Run recorded</span>}
          {run.avgHR && (
            <span>
              ❤️ avg {run.avgHR}
              {run.maxHR ? ` / max ${run.maxHR}` : ""} bpm
            </span>
          )}
        </div>
      )}

      {/* ── Quote ──────────────────────────────────────────── */}
      {enabled.quote && (
        <>
          <Divider color={t.text} />
          <div
            style={{
              textAlign: "center",
              fontStyle: "italic",
              fontSize: "9px",
              opacity: 0.45,
              padding: "4px 8px",
            }}
          >
            &ldquo;{quote}&rdquo;
          </div>
        </>
      )}

      {/* ── Footer ─────────────────────────────────────────── */}
      <Divider color={t.text} />
      <div
        style={{
          textAlign: "center",
          fontSize: "8px",
          opacity: 0.25,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        runceipt.app
      </div>
      <div style={{ textAlign: "center", fontSize: "10px", opacity: 0.1, letterSpacing: "0.08em" }}>
        ▮▯▮▯▮▮▯▮▯▮▯▮▮▯▯▯▮▮▯
      </div>
    </div>
  );
}

function Divider({ color }: { color: string }) {
  return <div style={{ borderTop: `1.5px dashed ${color}35`, margin: "10px 0" }} />;
}

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "8px",
        opacity: 0.4,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        marginBottom: "5px",
        color,
      }}
    >
      {children}
    </div>
  );
}
