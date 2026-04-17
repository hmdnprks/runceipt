import { Page } from "@playwright/test";

export const mockMe = { accessToken: "tok_123", name: "Test Runner", image: "" };

export const mockActivity = {
  id: 42,
  name: "Evening Run",
  date: "Monday, Jan 15, 2024",
  distance: "10.00 km",
  duration: "50:00",
  avgPace: "5:00 /km",
  calories: 600,
  elevation: "+150m",
  avgHR: 155,
  maxHR: 180,
  cadence: 170,
  isPR: true,
  summaryPolyline: "",
  splits: [
    { km: 1, pace: "5:00 /km", hr: 150, elevationDiff: 5 },
    { km: 2, pace: "4:50 /km", hr: 160, elevationDiff: -2 },
    { km: 3, pace: "5:10 /km", hr: 155, elevationDiff: 3 },
    { km: 4, pace: "4:45 /km", hr: 165, elevationDiff: -1 },
    { km: 5, pace: "5:05 /km", hr: 158, elevationDiff: 2 },
  ],
  hrZones: [
    { zone: "Z1 Easy", pct: 0, color: "#6ee7b7" },
    { zone: "Z2 Fat Burn", pct: 10, color: "#34d399" },
    { zone: "Z3 Aerobic", pct: 50, color: "#f59e0b" },
    { zone: "Z4 Threshold", pct: 30, color: "#f97316" },
    { zone: "Z5 Max", pct: 10, color: "#ef4444" },
  ],
  elevationProfile: [5, -2, 3, -1, 2],
};

export const mockActivityNoPR = { ...mockActivity, isPR: false, name: "Easy Jog" };

export async function setupReceiptPage(page: Page, activity = mockActivity) {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: mockMe }));
  await page.route("**/api/strava/activity/*", (route) => route.fulfill({ json: { activity } }));
}
