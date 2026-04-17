import type { ReceiptTheme } from "@/types/strava";

interface Props {
  polyline: string;
  theme: ReceiptTheme;
}

/** Decode a Google/Strava encoded polyline into [lat, lng] pairs */
function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e5, lng / 1e5]);
  }

  return coords;
}

/** Normalize coords to fit a viewBox */
function normalizeCoords(
  coords: [number, number][],
  width: number,
  height: number,
  padding: number
): [number, number][] {
  if (coords.length === 0) return [];

  const lats = coords.map((c) => c[0]);
  const lngs = coords.map((c) => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const rangeX = maxLng - minLng || 1;
  const rangeY = maxLat - minLat || 1;

  const usableW = width - padding * 2;
  const usableH = height - padding * 2;
  const scale = Math.min(usableW / rangeX, usableH / rangeY);

  return coords.map(([lat, lng]) => [
    padding + ((lng - minLng) * scale + (usableW - rangeX * scale) / 2),
    padding + ((maxLat - lat) * scale + (usableH - rangeY * scale) / 2),
  ]);
}

const FALLBACK_PATH = "M 20 80 C 35 65, 55 55, 75 45 S 110 30, 130 28 S 160 35, 175 55 S 168 78, 150 85 S 110 92, 85 88 S 45 80, 20 80";

export default function RouteSVG({ polyline, theme: t }: Props) {
  const W = 272;
  const H = 110;

  let pathD = "";
  let startX = 20, startY = 80, endX = 175, endY = 55;

  if (polyline) {
    try {
      const raw = decodePolyline(polyline);
      if (raw.length >= 2) {
        const pts = normalizeCoords(raw, W, H, 12);
        pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
        startX = pts[0][0];
        startY = pts[0][1];
        endX = pts[pts.length - 1][0];
        endY = pts[pts.length - 1][1];
      }
    } catch {
      // fall through to fallback
    }
  }

  if (!pathD) {
    pathD = FALLBACK_PATH;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100px" }}>
      {/* Grid */}
      {[H * 0.3, H * 0.6, H * 0.9].map((y) => (
        <line key={y} x1="0" y1={y} x2={W} y2={y} stroke={t.text} strokeOpacity="0.06" strokeWidth="0.5" />
      ))}
      {[W * 0.25, W * 0.5, W * 0.75].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2={H} stroke={t.text} strokeOpacity="0.06" strokeWidth="0.5" />
      ))}

      {/* Glow shadow */}
      <path d={pathD} fill="none" stroke={t.accent} strokeOpacity="0.12" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

      {/* Route line */}
      <path
        d={pathD}
        fill="none"
        stroke={t.accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Start circle */}
      <circle cx={startX} cy={startY} r="4" fill={t.accent} />
      <circle cx={startX} cy={startY} r="7" fill="none" stroke={t.accent} strokeWidth="1" strokeOpacity="0.3" />

      {/* End flag */}
      <circle cx={endX} cy={endY} r="4" fill={t.accent} />
      <circle cx={endX} cy={endY} r="2" fill={t.bg} />
    </svg>
  );
}
