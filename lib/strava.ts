import type {
  StravaSummaryActivity,
  StravaDetailedActivity,
  ProcessedRun,
  ProcessedSplit,
  HRZone,
} from "@/types/strava";

const STRAVA_BASE = "https://www.strava.com/api/v3";

// ─── Raw API calls ────────────────────────────────────────────────────────────

export async function fetchActivities(
  accessToken: string,
  page = 1,
  perPage = 20
): Promise<StravaSummaryActivity[]> {
  const res = await fetch(
    `${STRAVA_BASE}/athlete/activities?page=${page}&per_page=${perPage}&type=Run`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 }, // cache 60s
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to fetch Strava activities");
  }

  const activities: StravaSummaryActivity[] = await res.json();
  // Filter runs only (Strava type filter above may include virtual runs etc.)
  return activities.filter((a) =>
    ["Run", "TrailRun", "VirtualRun"].includes(a.sport_type)
  );
}

export async function fetchActivity(
  accessToken: string,
  activityId: number
): Promise<StravaDetailedActivity> {
  const res = await fetch(`${STRAVA_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to fetch activity");
  }

  return res.json();
}

// ─── Data transformers ────────────────────────────────────────────────────────

/** Format seconds → "h:mm:ss" or "mm:ss" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Format pace in seconds/km → "mm:ss /km" */
export function formatPace(speedMs: number, perKm = true): string {
  if (!speedMs || speedMs <= 0) return "--:--";
  const secsPerUnit = perKm ? 1000 / speedMs : 1609.34 / speedMs;
  const m = Math.floor(secsPerUnit / 60);
  const s = Math.round(secsPerUnit % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

/** Format meters → "12.4 km" */
export function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(2)} km`;
}

/** Format elevation gain → "+284m" */
export function formatElevation(meters: number): string {
  return `+${Math.round(meters)}m`;
}

/** Infer HR zones from splits heartrate data */
export function computeHRZones(splits: ProcessedSplit[], maxHR = 190): HRZone[] {
  const hrs = splits.map((s) => s.hr).filter((hr): hr is number => !!hr);
  if (hrs.length === 0) return [];

  const zones = [
    { zone: "Z1 Easy", min: 0, max: 0.6, color: "#6ee7b7" },
    { zone: "Z2 Fat Burn", min: 0.6, max: 0.7, color: "#34d399" },
    { zone: "Z3 Aerobic", min: 0.7, max: 0.8, color: "#f59e0b" },
    { zone: "Z4 Threshold", min: 0.8, max: 0.9, color: "#f97316" },
    { zone: "Z5 Max", min: 0.9, max: 1.0, color: "#ef4444" },
  ];

  return zones.map((z) => {
    const inZone = hrs.filter(
      (hr) => hr / maxHR >= z.min && hr / maxHR < z.max
    ).length;
    return {
      zone: z.zone,
      pct: Math.round((inZone / hrs.length) * 100),
      color: z.color,
    };
  });
}

/** Transform a detailed Strava activity into our clean ProcessedRun shape */
export function processActivity(a: StravaDetailedActivity): ProcessedRun {
  const splits: ProcessedSplit[] = (a.splits_metric ?? []).map((s) => ({
    km: s.split,
    pace: formatPace(s.average_speed),
    hr: s.average_heartrate ? Math.round(s.average_heartrate) : undefined,
    elevationDiff: Math.round(s.elevation_difference),
  }));

  return {
    id: a.id,
    name: a.name,
    date: new Date(a.start_date_local).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    distance: formatDistance(a.distance),
    duration: formatDuration(a.moving_time),
    avgPace: formatPace(a.average_speed),
    calories: a.calories,
    elevation: formatElevation(a.total_elevation_gain),
    avgHR: a.average_heartrate ? Math.round(a.average_heartrate) : undefined,
    maxHR: a.max_heartrate ? Math.round(a.max_heartrate) : undefined,
    cadence: a.average_cadence ? Math.round(a.average_cadence * 2) : undefined, // Strava gives one-foot cadence
    isPR: a.pr_count > 0,
    summaryPolyline: a.map?.summary_polyline ?? "",
    splits,
    hrZones: computeHRZones(splits, a.max_heartrate ?? 190),
    elevationProfile: (a.splits_metric ?? []).map((s) =>
      Math.round(s.elevation_difference)
    ),
  };
}

/** Transform a summary activity for the activity list */
export function processSummaryActivity(
  a: StravaSummaryActivity
): Omit<ProcessedRun, "splits" | "hrZones" | "elevationProfile"> {
  return {
    id: a.id,
    name: a.name,
    date: new Date(a.start_date_local).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    distance: formatDistance(a.distance),
    duration: formatDuration(a.moving_time),
    avgPace: formatPace(a.average_speed),
    calories: a.calories,
    elevation: formatElevation(a.total_elevation_gain),
    avgHR: a.average_heartrate ? Math.round(a.average_heartrate) : undefined,
    maxHR: a.max_heartrate ? Math.round(a.max_heartrate) : undefined,
    cadence: a.average_cadence ? Math.round(a.average_cadence * 2) : undefined,
    isPR: a.pr_count > 0,
    summaryPolyline: a.map?.summary_polyline ?? "",
  };
}
