import { test, expect, Page } from "@playwright/test";

const mockMe = { accessToken: "tok_123", name: "Test Runner", image: "" };

const mockActivities = [
  {
    id: 1, name: "Morning Run", date: "Mon, Jan 15",
    distance: "10.00 km", duration: "50:00", avgPace: "5:00 /km",
    elevation: "+150m", isPR: false, summaryPolyline: "", calories: 500, cadence: 170,
  },
  {
    id: 2, name: "PR Run", date: "Tue, Jan 16",
    distance: "5.00 km", duration: "22:00", avgPace: "4:24 /km",
    elevation: "+50m", isPR: true, summaryPolyline: "", calories: 300, cadence: 180,
  },
];

async function setupDashboard(page: Page, activities = mockActivities) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ json: mockMe })
  );
  await page.route("**/api/strava/activities*", (route) =>
    route.fulfill({ json: { activities, page: 1, perPage: 20 } })
  );
}

test.describe("Dashboard", () => {
  test("redirects to home when unauthenticated", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ json: { error: "Unauthorized" } })
    );
    await page.goto("/dashboard");
    await page.waitForURL("/");
    expect(page.url()).toContain("/");
  });

  test("displays user info and activity list", async ({ page }) => {
    await setupDashboard(page);
    await page.goto("/dashboard");

    await expect(page.getByText("Test Runner")).toBeVisible();
    await expect(page.getByText("Your Runs")).toBeVisible();
    await expect(page.getByText("Morning Run")).toBeVisible();
    await expect(page.getByText("PR Run")).toBeVisible();
  });

  test("shows PR badge on PR activities", async ({ page }) => {
    await setupDashboard(page);
    await page.goto("/dashboard");

    await expect(page.getByText("🏅 PR")).toBeVisible();
  });

  test("displays activity stats on cards", async ({ page }) => {
    await setupDashboard(page);
    await page.goto("/dashboard");

    await expect(page.getByText("10.00 km")).toBeVisible();
    await expect(page.getByText("50:00")).toBeVisible();
  });

  test("shows empty state when no activities", async ({ page }) => {
    await setupDashboard(page, []);
    await page.goto("/dashboard");

    await expect(page.getByText("No runs found")).toBeVisible();
  });

  test("navigates to receipt page on card click", async ({ page }) => {
    await setupDashboard(page);
    await page.goto("/dashboard");

    await page.getByText("Morning Run").click();
    await page.waitForURL("**/receipt/1");
    expect(page.url()).toContain("/receipt/1");
  });

  test("sign out button exists", async ({ page }) => {
    await setupDashboard(page);
    await page.goto("/dashboard");

    await expect(page.getByText("Sign out")).toBeVisible();
  });
});
