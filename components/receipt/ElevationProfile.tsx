import type { ReceiptTheme } from "@/types/strava";

interface Props {
  data: number[]; // elevation_difference per split (can be negative)
  theme: ReceiptTheme;
}

export default function ElevationProfile({ data, theme: t }: Props) {
  const W = 272;
  const H = 56;
  const pad = 6;

  // Convert diffs to cumulative elevation
  const cumulative: number[] = [];
  let acc = 0;
  for (const d of data) {
    acc += d;
    cumulative.push(acc);
  }

  const min = Math.min(0, ...cumulative);
  const max = Math.max(...cumulative);
  const range = max - min || 1;

  const xs = cumulative.map(
    (_, i) => pad + (i / Math.max(cumulative.length - 1, 1)) * (W - pad * 2)
  );
  const ys = cumulative.map((v) => H - pad - ((v - min) / range) * (H - pad * 2));

  const linePath = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${xs[xs.length - 1].toFixed(1)} ${H} L ${xs[0].toFixed(1)} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "56px" }}>
      <defs>
        <linearGradient id="elvGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={t.accent} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#elvGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke={t.accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
