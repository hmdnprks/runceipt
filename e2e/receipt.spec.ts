import { test, expect, Page } from "@playwright/test";

const mockMe = { accessToken: "tok_123", name: "Test Runner", image: "" };

const mockActivity = {
  id: 42, name: "Evening Run", date: "Monday, Jan 15, 2024",
  distance: "10.00 km", duration: "50:00", avgPace: "5:00 /km",
  calories: 600, elevation: "+150m", avgHR: 155, maxHR: 180, cadence: 170,
  isPR: true, summaryPolyline: "",
  splits: [
    { km: 1, pace: "5:00 /km", hr: 150, elevationDiff: 5 },
    { km: 2, pace: "4:50 /km", hr: 160, elevationDiff: -2 },
  ],
  hrZones: [
    { zone: "Z3 Aerobic", pct: 60, color: "#f59e0b" },
    { zone: "Z4 Threshold", pct: 40, color: "#f97316" },
  ],
  elevationProfile: [5, -2],
};

async function setupReceipt(page: Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ json: mockMe })
  );
  await page.route("**/api/strava/activity/*", (route) =>
    route.fulfill({ json: { activity: mockActivity } })
  );
}

test.describe("Receipt page", () => {
  test("redirects to home when unauthenticated", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ json: { error: "Unauthorized" } })
    );
    await page.goto("/receipt/42");
    await page.waitForURL("/");
  });

  test("renders receipt with activity data", async ({ page }) => {
    await setupReceipt(page);
    await page.goto("/receipt/42");

    await expect(page.getByText("Evening Run")).toBeVisible();
    await expect(page.getByText("10.00 km")).toBeVisible();
    await expect(page.getByText("50:00")).toBeVisible();
  });

  test("shows all theme options", async ({ page }) => {
    await setupReceipt(page);
    await page.goto("/receipt/42");

    await expect(page.getByText("Thermal")).toBeVisible();
    await expect(page.getByText("Night Run")).toBeVisible();
    await expect(page.getByText("Neon")).toBeVisible();
    await expect(page.getByText("Minimal")).toBeVisible();
  });

  test("switches theme on click", async ({ page }) => {
    await setupReceipt(page);
    await page.goto("/receipt/42");

    // Click Night Run theme
    await page.getByText("Night Run").click();
    // The active theme should show a checkmark
    const nightBtn = page.getByText("Night Run").locator("..");
    await expect(nightBtn).toContainText("✓");
  });

  test("shows module toggles", async ({ page }) => {
    await setupReceipt(page);
    await page.goto("/receipt/42");

    await expect(page.getByText("Route Map")).toBeVisible();
    await expect(page.getByText("Key Stats")).toBeVisible();
    await expect(page.getByText("Pace Chart")).toBeVisible();
    await expect(page.getByRole("button", { name: /Heart Rate Zones/ })).toBeVisible();
    await expect(page.getByText("Split Table")).toBeVisible();
  });

  test("toggles module off and on", async ({ page }) => {
    await setupReceipt(page);
    await page.goto("/receipt/42");

    // Stats enabled by default — distance visible in receipt
    await expect(page.locator("text=10.00 km")).toBeVisible();

    // Toggle off Key Stats
    await page.getByText("Key Stats").click();
    // The stat should disappear from the receipt preview
    // Wait a moment for re-render
    await page.waitForTimeout(300);

    // Toggle back on
    await page.getByText("Key Stats").click();
    await expect(page.locator("text=10.00 km")).toBeVisible();
  });

  test("allows editing run title", async ({ page }) => {
    await setupReceipt(page);
    await page.goto("/receipt/42");

    const input = page.locator("input[placeholder='Rename your run...']");
    await expect(input).toHaveValue("Evening Run");

    await input.clear();
    await input.fill("My Custom Title");

    // The receipt should reflect the new title
    await expect(page.getByText("My Custom Title")).toBeVisible();
  });

  test("shows action buttons", async ({ page }) => {
    await setupReceipt(page);
    await page.goto("/receipt/42");

    await expect(page.getByText("🖨️ Animate Print")).toBeVisible();
    await expect(page.getByText("⬇️ Export PNG")).toBeVisible();
    await expect(page.getByText("📤 Share")).toBeVisible();
  });

  test("back button navigates to dashboard", async ({ page }) => {
    await setupReceipt(page);
    // Also mock activities for dashboard
    await page.route("**/api/strava/activities*", (route) =>
      route.fulfill({ json: { activities: [], page: 1, perPage: 20 } })
    );

    await page.goto("/receipt/42");
    await page.getByText("← All runs").click();
    await page.waitForURL("**/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("shows error screen for failed activity fetch", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ json: mockMe })
    );
    await page.route("**/api/strava/activity/*", (route) =>
      route.fulfill({ json: { error: "Activity not found" } })
    );

    await page.goto("/receipt/42");
    await expect(page.getByText("Activity not found")).toBeVisible();
    await expect(page.getByText("← Back to dashboard")).toBeVisible();
  });
});
