import type { ProcessedSplit, ReceiptTheme } from "@/types/strava";

interface Props {
  splits: ProcessedSplit[];
  theme: ReceiptTheme;
}

function paceToSeconds(pace: string): number {
  const clean = pace.replace(" /km", "").trim();
  const [m, s] = clean.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}

export default function PaceChart({ splits, theme: t }: Props) {
  const paces = splits.map((s) => paceToSeconds(s.pace)).filter((p) => p > 0);
  if (paces.length === 0) return null;

  const min = Math.min(...paces);
  const max = Math.max(...paces);
  const range = max - min || 1;
  const H = 50;
  const barW = Math.max(10, Math.floor(268 / paces.length) - 3);

  return (
    <svg
      viewBox={`0 0 ${paces.length * (barW + 3)} ${H + 18}`}
      style={{ width: "100%", height: "70px" }}
    >
      {paces.map((p, i) => {
        const barH = ((p - min) / range) * (H - 14) + 8;
        const isBest = p === min;
        const isWorst = p === max;
        const fill = isBest
          ? t.accent
          : isWorst
          ? `${t.text}55`
          : `${t.text}30`;

        return (
          <g key={i}>
            <rect
              x={i * (barW + 3)}
              y={H - barH}
              width={barW}
              height={barH}
              fill={fill}
              rx={2}
            />
            {/* km label */}
            {paces.length <= 15 && (
              <text
                x={i * (barW + 3) + barW / 2}
                y={H + 13}
                textAnchor="middle"
                fontSize="7"
                fill={t.text}
                fillOpacity="0.35"
              >
                {i + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
