import {
  formatDuration,
  formatPace,
  formatDistance,
  formatElevation,
  computeHRZones,
  processActivity,
} from "@/lib/strava";
import type { StravaDetailedActivity, ProcessedSplit } from "@/types/strava";

// ─── formatDuration ──────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("formats seconds under an hour as mm:ss", () => {
    expect(formatDuration(125)).toBe("2:05");
  });

  it("formats seconds over an hour as h:mm:ss", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("pads minutes and seconds", () => {
    expect(formatDuration(7200)).toBe("2:00:00");
  });
});

// ─── formatPace ──────────────────────────────────────────────────────────────

describe("formatPace", () => {
  it("returns formatted pace for valid speed", () => {
    // 3.33 m/s ≈ 5:00 /km
    expect(formatPace(3.333)).toBe("5:00 /km");
  });

  it("returns --:-- for zero speed", () => {
    expect(formatPace(0)).toBe("--:--");
  });

  it("returns --:-- for negative speed", () => {
    expect(formatPace(-1)).toBe("--:--");
  });
});

// ─── formatDistance ──────────────────────────────────────────────────────────

describe("formatDistance", () => {
  it("converts meters to km with 2 decimals", () => {
    expect(formatDistance(10000)).toBe("10.00 km");
    expect(formatDistance(5123)).toBe("5.12 km");
  });
});

// ─── formatElevation ─────────────────────────────────────────────────────────

describe("formatElevation", () => {
  it("rounds and prefixes with +", () => {
    expect(formatElevation(284.7)).toBe("+285m");
    expect(formatElevation(0)).toBe("+0m");
  });
});

// ─── computeHRZones ──────────────────────────────────────────────────────────

describe("computeHRZones", () => {
  it("returns empty array when no HR data", () => {
    const splits: ProcessedSplit[] = [{ km: 1, pace: "5:00 /km" }];
    expect(computeHRZones(splits)).toEqual([]);
  });

  it("distributes HR values into correct zones", () => {
    const maxHR = 200;
    // Z1: <120, Z2: 120-140, Z3: 140-160, Z4: 160-180, Z5: 180-200
    const splits: ProcessedSplit[] = [
      { km: 1, pace: "5:00", hr: 100 },  // Z1
      { km: 2, pace: "5:00", hr: 130 },  // Z2
      { km: 3, pace: "5:00", hr: 150 },  // Z3
      { km: 4, pace: "5:00", hr: 170 },  // Z4
      { km: 5, pace: "5:00", hr: 190 },  // Z5
    ];
    const zones = computeHRZones(splits, maxHR);
    expect(zones).toHaveLength(5);
    expect(zones.every((z) => z.pct === 20)).toBe(true);
  });
});

// ─── processActivity ─────────────────────────────────────────────────────────

describe("processActivity", () => {
  const mockActivity: StravaDetailedActivity = {
    id: 123,
    name: "Morning Run",
    distance: 10000,
    moving_time: 3000,
    elapsed_time: 3100,
    total_elevation_gain: 150,
    type: "Run",
    sport_type: "Run",
    start_date: "2024-01-15T08:00:00Z",
    start_date_local: "2024-01-15T08:00:00Z",
    timezone: "UTC",
    average_speed: 3.33,
    max_speed: 4.5,
    average_heartrate: 155,
    max_heartrate: 180,
    average_cadence: 85,
    calories: 600,
    map: { id: "m1", summary_polyline: "abc", resource_state: 2 },
    achievement_count: 1,
    pr_count: 1,
    splits_metric: [
      { distance: 1000, elapsed_time: 300, elevation_difference: 5, moving_time: 295, split: 1, average_speed: 3.33, average_heartrate: 150, pace_zone: 3 },
      { distance: 1000, elapsed_time: 310, elevation_difference: -2, moving_time: 305, split: 2, average_speed: 3.2, average_heartrate: 160, pace_zone: 3 },
    ],
    splits_standard: [],
    laps: [],
    segment_efforts: [],
    best_efforts: [],
  };

  it("transforms activity into ProcessedRun shape", () => {
    const result = processActivity(mockActivity);

    expect(result.id).toBe(123);
    expect(result.name).toBe("Morning Run");
    expect(result.distance).toBe("10.00 km");
    expect(result.duration).toBe("50:00");
    expect(result.elevation).toBe("+150m");
    expect(result.calories).toBe(600);
    expect(result.avgHR).toBe(155);
    expect(result.maxHR).toBe(180);
    expect(result.cadence).toBe(170); // 85 * 2
    expect(result.isPR).toBe(true);
    expect(result.summaryPolyline).toBe("abc");
  });

  it("produces correct splits", () => {
    const result = processActivity(mockActivity);
    expect(result.splits).toHaveLength(2);
    expect(result.splits[0].km).toBe(1);
    expect(result.splits[0].hr).toBe(150);
    expect(result.splits[0].elevationDiff).toBe(5);
  });

  it("computes elevation profile from splits", () => {
    const result = processActivity(mockActivity);
    expect(result.elevationProfile).toEqual([5, -2]);
  });

  it("handles missing optional fields", () => {
    const minimal: StravaDetailedActivity = {
      ...mockActivity,
      average_heartrate: undefined,
      max_heartrate: undefined,
      average_cadence: undefined,
      calories: undefined,
      map: { id: "m1", summary_polyline: "", resource_state: 2 },
      pr_count: 0,
      splits_metric: [],
    };
    const result = processActivity(minimal);
    expect(result.avgHR).toBeUndefined();
    expect(result.cadence).toBeUndefined();
    expect(result.isPR).toBe(false);
    expect(result.splits).toEqual([]);
  });
});
