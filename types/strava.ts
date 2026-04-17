// ─── Strava API Types ────────────────────────────────────────────────────────

export interface StravaSummaryActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  type: string; // "Run", "Ride", etc.
  sport_type: string;
  start_date: string; // ISO 8601
  start_date_local: string;
  timezone: string;
  average_speed: number; // m/s
  max_speed: number; // m/s
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  calories?: number;
  map: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  achievement_count: number;
  pr_count: number;
  suffer_score?: number;
}

export interface StravaDetailedActivity extends StravaSummaryActivity {
  description?: string;
  laps: StravaLap[];
  splits_metric: StravaSplit[];
  splits_standard: StravaSplit[];
  segment_efforts: unknown[];
  best_efforts: StravaBestEffort[];
}

export interface StravaLap {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  average_speed: number;
  average_heartrate?: number;
  lap_index: number;
}

export interface StravaSplit {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  average_heartrate?: number;
  average_grade_adjusted_speed?: number;
  pace_zone: number;
}

export interface StravaBestEffort {
  name: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  pr_rank?: number;
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city?: string;
  country?: string;
}

// ─── App Types ────────────────────────────────────────────────────────────────

export type ModuleId =
  | "route"
  | "stats"
  | "pace_chart"
  | "elevation"
  | "hr_zones"
  | "splits"
  | "weather"
  | "pr_badge"
  | "quote";

export type ThemeId = "thermal" | "night" | "neon" | "minimal";

export interface ReceiptTheme {
  id: ThemeId;
  label: string;
  bg: string;
  text: string;
  accent: string;
  font: "mono" | "serif";
}

export interface ReceiptModule {
  id: ModuleId;
  label: string;
  icon: string;
  defaultEnabled: boolean;
}

export interface ReceiptConfig {
  enabledModules: Record<ModuleId, boolean>;
  themeId: ThemeId;
  customTitle?: string;
}

// ─── Processed run data for receipt ──────────────────────────────────────────

export interface ProcessedRun {
  id: number;
  name: string;
  date: string;
  distance: string; // formatted, e.g. "12.4 km"
  duration: string; // formatted, e.g. "1:02:34"
  avgPace: string; // formatted, e.g. "5:03 /km"
  calories?: number;
  elevation: string; // formatted, e.g. "+284m"
  avgHR?: number;
  maxHR?: number;
  cadence?: number;
  isPR: boolean;
  summaryPolyline: string;
  splits: ProcessedSplit[];
  hrZones?: HRZone[];
  elevationProfile?: number[];
}

export interface ProcessedSplit {
  km: number;
  pace: string; // formatted mm:ss
  hr?: number;
  elevationDiff?: number;
}

export interface HRZone {
  zone: string;
  pct: number;
  color: string;
}
