"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ProcessedRun } from "@/types/strava";
import MiniRoute from "@/components/receipt/MiniRoute";

type Me = { name: string; image: string; accessToken: string };

export default function Dashboard() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [activities, setActivities] = useState<Omit<ProcessedRun, "splits" | "hrZones" | "elevationProfile">[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push("/"); return; }
        setMe(data);
      });
  }, [router]);

  useEffect(() => {
    if (!me) return;
    setLoading(true);
    fetch(`/api/strava/activities?page=${page}&per_page=20`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setActivities(prev => page === 1 ? data.activities : [...prev, ...data.activities]);
        setHasMore(data.activities.length === 20);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [me, page]);

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLogo}>Runceipt</div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {me?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me?.image} alt="avatar" style={s.avatar} />
          )}
          <span style={s.userName}>{me?.name}</span>
          <button onClick={() => window.location.href = "/api/auth/logout"} style={s.signOutBtn}>
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={s.main}>
        <h1 style={s.h1}>Your Runs</h1>
        <p style={s.subtitle}>Select a run to generate its receipt</p>

        {error && (
          <div style={s.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <div style={s.grid}>
          {activities.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              onClick={() => router.push(`/receipt/${a.id}`)}
            />
          ))}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>

        {!loading && hasMore && activities.length > 0 && (
          <button onClick={() => setPage((p) => p + 1)} style={s.loadMoreBtn}>
            Load more runs
          </button>
        )}

        {!loading && activities.length === 0 && !error && (
          <div style={s.emptyState}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏃</div>
            <p style={{ color: "#888", fontSize: "13px" }}>No runs found. Go run something!</p>
          </div>
        )}
      </main>
    </div>
  );
}

function ActivityCard({
  activity: a,
  onClick,
}: {
  activity: Omit<ProcessedRun, "splits" | "hrZones" | "elevationProfile">;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={s.cardTitle}>{a.name}</div>
        {a.isPR && <span style={s.prBadge}>🏅 PR</span>}
      </div>
      <div style={s.cardDate}>{a.date}</div>

      <MiniRoute polyline={a.summaryPolyline} />

      <div style={s.statsRow}>
        <Stat label="Dist" value={a.distance} />
        <Stat label="Time" value={a.duration} />
        <Stat label="Pace" value={a.avgPace.replace(" /km", "")} />
      </div>
      <div style={s.cardFooter}>
        <span style={s.cardCta}>Generate receipt →</span>
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#fff", fontSize: "8px", textTransform: "uppercase" as const, letterSpacing: "0.12em", marginBottom: "2px" }}>{label}</div>
      <div style={{ color: "#6ee7b7", fontSize: "13px", fontWeight: "700" }}>{value}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ ...s.card, cursor: "default" }}>
      {[80, 50, 100].map((w, i) => (
        <div key={i} style={{ height: "10px", background: "#222", borderRadius: "2px", marginBottom: "10px", width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#888", fontFamily: "monospace" }}>Loading your runs...</p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "#111", fontFamily: "'Courier New', monospace" },
  header: { borderBottom: "1px solid #1e1e1e", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerLogo: { color: "#fff", fontSize: "15px", fontWeight: "700", letterSpacing: "0.06em" },
  avatar: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" },
  userName: { color: "#888", fontSize: "11px" },
  signOutBtn: { background: "none", border: "1px solid #2a2a2a", color: "#555", borderRadius: "4px", padding: "5px 10px", fontSize: "10px", cursor: "pointer", fontFamily: "'Courier New', monospace" },
  main: { maxWidth: "960px", margin: "0 auto", padding: "48px 32px" },
  h1: { color: "#fff", fontSize: "22px", fontWeight: "700", marginBottom: "6px" },
  subtitle: { color: "#555", fontSize: "11px", letterSpacing: "0.1em", marginBottom: "32px" },
  errorBox: { background: "#1a0a0a", border: "1px solid #3a1a1a", color: "#ff6b6b", padding: "12px 16px", borderRadius: "4px", marginBottom: "24px", fontSize: "12px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" },
  card: { background: "#161616", border: "1px solid #222", borderRadius: "6px", padding: "20px", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s, transform 0.1s", width: "100%", fontFamily: "'Courier New', monospace" },
  cardTitle: { color: "#fff", fontSize: "13px", fontWeight: "700", lineHeight: "1.3", flex: 1, marginRight: "8px" },
  cardDate: { color: "#fff", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: "8px" },
  cardCta: { color: "#555", fontSize: "9px", letterSpacing: "0.12em" },
  statsRow: { display: "flex", gap: "20px", marginBottom: "14px" },
  prBadge: { fontSize: "11px", flexShrink: 0 },
  cardFooter: { borderTop: "1px solid #1e1e1e", paddingTop: "10px" },
  loadMoreBtn: { display: "block", margin: "32px auto 0", background: "none", border: "1px solid #2a2a2a", color: "#555", borderRadius: "4px", padding: "10px 24px", fontSize: "11px", cursor: "pointer", fontFamily: "'Courier New', monospace" },
  emptyState: { textAlign: "center", padding: "80px 20px" },
};
