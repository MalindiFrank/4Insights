import { test, expect } from '@playwright/test';
import process from "node:process";

const BASE = process.env.BASE_URL || 'http://localhost:5173';

// Minimal local Page interface for type-checking without importing Playwright types
type MinimalLocator = {
  count(): Promise<number>;
  click(): Promise<void>;
  isVisible?(): Promise<boolean>;
  toHaveText?: (t: string | RegExp) => Promise<void>;
};

type MinimalPage = {
  goto(url: string): Promise<void>;
  locator(selector: string): MinimalLocator & { toBeVisible?: (opts?: { timeout?: number }) => Promise<void> };
};

test('dashboard loads and shows metrics', async ({ page }: { page: MinimalPage }) => {
  // Navigate to the dashboard
  await page.goto(BASE);

  // Wait for the title to be visible (give app time to hydrate)
  const title = page.locator('h1.title');
  await expect(title).toBeVisible({ timeout: 10_000 });
  await expect(title).toHaveText(/4Insights/);

  // Click refresh (if present) and ensure metrics area loads
  const refresh = page.locator('button.refresh');
  if (await refresh.count() > 0) {
    await refresh.click();
  }

  // Check that the page loaded some metrics or at least a loading/empty state resolves
  await expect(page.locator('.muted')).toBeVisible({ timeout: 10_000 });
});
