import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('dashboard loads and shows metrics', async ({ page }: { page: Page }) => {
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
