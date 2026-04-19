import { test, expect } from "@playwright/test";
import { setupReceiptPage, mockActivity, mockActivityNoPR } from "./fixtures";

async function waitForReceipt(page: import("@playwright/test").Page) {
  await page.getByText(mockActivity.distance).waitFor({ state: "visible" });
  // Small delay for fonts/rendering to settle
  await page.waitForTimeout(500);
}

// ─── Theme visual regression ─────────────────────────────────────────────────

test.describe("Visual: Receipt themes", () => {
  const themes = ["Thermal", "Night Run", "Neon", "Minimal"];

  for (const theme of themes) {
    test(`receipt - ${theme} theme`, async ({ page }) => {
      await setupReceiptPage(page);
      await page.goto("/receipt/42");
      await waitForReceipt(page);

      if (theme !== "Thermal") {
        await page.getByText(theme).click();
        await page.waitForTimeout(300);
      }

      await expect(page).toHaveScreenshot(`receipt-${theme.toLowerCase().replace(" ", "-")}.png`, {
        fullPage: false,
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});

// ─── PR badge visual regression ──────────────────────────────────────────────

test.describe("Visual: PR badge", () => {
  test("receipt with PR badge", async ({ page }) => {
    await setupReceiptPage(page, mockActivity);
    await page.goto("/receipt/42");
    await waitForReceipt(page);

    await expect(page).toHaveScreenshot("receipt-with-pr.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("receipt without PR badge", async ({ page }) => {
    await setupReceiptPage(page, mockActivityNoPR);
    await page.goto("/receipt/42");
    await page.getByText(mockActivityNoPR.distance).waitFor({ state: "visible" });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("receipt-without-pr.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

// ─── Module toggle visual regression ─────────────────────────────────────────

test.describe("Visual: Module toggles", () => {
  test("receipt with all modules enabled", async ({ page }) => {
    await setupReceiptPage(page);
    await page.goto("/receipt/42");
    await waitForReceipt(page);

    // Enable all optional modules
    const optionalModules = ["Elevation Profile", "Split Table", "Motivational Quote"];
    for (const mod of optionalModules) {
      await page.getByText(mod).click();
    }
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot("receipt-all-modules.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("receipt with minimal modules (stats only)", async ({ page }) => {
    await setupReceiptPage(page);
    await page.goto("/receipt/42");
    await waitForReceipt(page);

    // Disable default-enabled modules except stats
    const toDisable = ["Route Map", "Pace Chart", "Weather Stamp", "PR Badge"];
    for (const mod of toDisable) {
      await page.getByText(mod).click();
    }
    // Also disable HR zones
    await page.getByRole("button", { name: /Heart Rate Zones/ }).click();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot("receipt-stats-only.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

// ─── Full page visual regression ─────────────────────────────────────────────

test.describe("Visual: Full pages", () => {
  test("landing page", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ status: 401, json: { error: "Unauthorized" } })
    );
    await page.goto("/");
    await page.getByText("CONNECT YOUR RUNS").waitFor({ state: "visible" });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("landing-page.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("dashboard with activities", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ json: { accessToken: "tok", name: "Test Runner", image: "" } })
    );
    await page.route("**/api/strava/activities*", (route) =>
      route.fulfill({
        json: {
          activities: [
            { ...mockActivity, id: 1, name: "Morning Run", isPR: false },
            { ...mockActivity, id: 2, name: "PR Run", isPR: true },
            { ...mockActivity, id: 3, name: "Trail Run", isPR: false, distance: "15.30 km" },
          ],
          page: 1,
          perPage: 20,
        },
      })
    );

    await page.goto("/dashboard");
    await page.getByText("Morning Run").waitFor({ state: "visible" });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("dashboard.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
