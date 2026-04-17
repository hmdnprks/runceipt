import type { HRZone, ReceiptTheme } from "@/types/strava";

interface Props {
  zones: HRZone[];
  theme: ReceiptTheme;
}

export default function HRZones({ zones, theme: t }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {zones
        .filter((z) => z.pct > 0)
        .map((z) => (
          <div
            key={z.zone}
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "9px" }}
          >
            <span style={{ color: t.text, opacity: 0.55, width: "80px", fontFamily: "inherit" }}>
              {z.zone}
            </span>
            <div
              style={{
                flex: 1,
                background: `${t.text}12`,
                borderRadius: "2px",
                overflow: "hidden",
                height: "7px",
              }}
            >
              <div
                style={{
                  width: `${z.pct}%`,
                  background: z.color,
                  height: "100%",
                  borderRadius: "2px",
                }}
              />
            </div>
            <span
              style={{
                color: t.text,
                opacity: 0.6,
                width: "26px",
                textAlign: "right",
                fontFamily: "inherit",
              }}
            >
              {z.pct}%
            </span>
          </div>
        ))}
    </div>
  );
}
