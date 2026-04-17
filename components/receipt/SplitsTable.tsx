import { Zap } from "lucide-react";
import type { ProcessedSplit, ReceiptTheme } from "@/types/strava";

interface Props {
  splits: ProcessedSplit[];
  theme: ReceiptTheme;
}

export default function SplitsTable({ splits, theme: t }: Props) {
  const paces = splits.map((s) => {
    const clean = s.pace.replace(" /km", "").trim();
    const [m, sec] = clean.split(":").map(Number);
    return m * 60 + sec;
  });
  const fastestIdx = paces.indexOf(Math.min(...paces));

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
      <thead>
        <tr>
          {["KM", "Pace", "HR", "Elev"].map((h) => (
            <td
              key={h}
              style={{
                color: t.text,
                opacity: 0.35,
                paddingBottom: "4px",
                fontSize: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {h}
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {splits.map((s, i) => (
          <tr key={s.km} style={{ borderTop: `1px solid ${t.text}10` }}>
            <td style={{ padding: "2.5px 0", opacity: 0.5 }}>{s.km}</td>
            <td
              style={{
                padding: "2.5px 0",
                fontWeight: i === fastestIdx ? "700" : "400",
                color: i === fastestIdx ? t.accent : t.text,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                {s.pace.replace(" /km", "")}
                {i === fastestIdx && <Zap size={8} strokeWidth={2} />}
              </span>
            </td>
            <td style={{ padding: "2.5px 0", opacity: 0.6 }}>{s.hr ? `${s.hr}` : "—"}</td>
            <td style={{ padding: "2.5px 0", opacity: 0.5 }}>
              {s.elevationDiff != null
                ? `${s.elevationDiff > 0 ? "+" : ""}${s.elevationDiff}m`
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
