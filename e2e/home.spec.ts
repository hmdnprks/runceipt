import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("shows landing page with login button when unauthenticated", async ({ page }) => {
    // Mock /api/auth/me to return unauthorized
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ status: 401, json: { error: "Unauthorized" } })
    );

    await page.goto("/");
    await expect(page.getByText("Runceipt")).toBeVisible();
    await expect(page.getByText("CONNECT YOUR RUNS")).toBeVisible();
    await expect(page.getByText("5.20 km").first()).toBeVisible();
  });

  test("redirects to dashboard when authenticated", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        json: { accessToken: "tok_123", name: "Test Runner", image: "" },
      })
    );

    await page.goto("/");
    await page.waitForURL("**/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("login button navigates to Strava OAuth", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ status: 401, json: { error: "Unauthorized" } })
    );

    await page.goto("/");
    await expect(page.getByText("CONNECT YOUR RUNS")).toBeVisible();

    // Click should navigate to /api/auth/login which redirects to Strava
    const [response] = await Promise.all([
      page.waitForResponse("**/api/auth/login"),
      page.getByText("CONNECT YOUR RUNS").click(),
    ]);
    expect(response.status()).toBe(307); // redirect
  });
});
