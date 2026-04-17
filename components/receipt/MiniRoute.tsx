export default function MiniRoute({ polyline }: { polyline: string }) {
  if (!polyline) return null;

  // Decode polyline
  const coords: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < polyline.length) {
    let shift = 0, result = 0, byte: number;
    do { byte = polyline.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { byte = polyline.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e5, lng / 1e5]);
  }

  if (coords.length < 2) return null;

  // Normalize to fit viewBox
  const lats = coords.map(c => c[0]);
  const lngs = coords.map(c => c[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const W = 100, H = 60, pad = 6;
  const rangeX = maxLng - minLng || 1;
  const rangeY = maxLat - minLat || 1;
  const scale = Math.min((W - pad * 2) / rangeX, (H - pad * 2) / rangeY);

  const pts = coords.map(([la, ln]) => [
    pad + ((ln - minLng) * scale + (W - pad * 2 - rangeX * scale) / 2),
    pad + ((maxLat - la) * scale + (H - pad * 2 - rangeY * scale) / 2),
  ]);

  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "60px", marginBottom: "10px" }}>
      <path d={d} fill="none" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx={pts[0][0]} cy={pts[0][1]} r="2" fill="#6ee7b7" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill="#6ee7b7" />
    </svg>
  );
}