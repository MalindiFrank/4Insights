import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E tests for 4Insights Dashboard
 * Tests the complete authentication flow and metrics display
 */

test.describe('4Insights Dashboard E2E', () => {

  test('about page loads without authentication', async ({ page }) => {
    await page.goto('/about');

    // Check page title
    await expect(page.locator('h1')).toContainText('About');

    // Check for some content
    await expect(page.locator('body')).toContainText('4Insights');
  });

  test('unauthenticated user redirects to login', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');

    // Check login page loaded
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('complete authentication flow and metrics display', async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Login');

    // Step 2: Generate credentials
    const generateButton = page.locator('button:has-text("Generate Credentials")');
    await expect(generateButton).toBeVisible();
    await generateButton.click();

    // Wait for credentials to be generated and displayed
    const apiKeyInput = page.locator('input[placeholder*="API Key"]');
    const passphraseInput = page.locator('input[placeholder*="Passphrase"]');

    await expect(apiKeyInput).toBeVisible({ timeout: 10_000 });
    await expect(passphraseInput).toBeVisible({ timeout: 10_000 });

    // Verify credentials are populated
    const apiKey = await apiKeyInput.inputValue();
    const passphrase = await passphraseInput.inputValue();

    expect(apiKey).toBeTruthy();
    expect(apiKey.length).toBeGreaterThan(0);
    expect(passphrase).toBeTruthy();
    expect(passphrase.length).toBeGreaterThan(0);

    // Step 3: Login with generated credentials
    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // Step 4: Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/', { timeout: 10_000 });

    // Step 5: Verify dashboard loaded
    const dashboardTitle = page.locator('h1:has-text("4Insights")');
    await expect(dashboardTitle).toBeVisible({ timeout: 10_000 });

    // Step 6: Wait for metrics to load (or error state)
    await page.waitForSelector('.card, .error', { timeout: 15_000 });

    // Step 7: Verify metrics display (either data or "No data yet")
    const metricsCards = page.locator('.card');
    await expect(metricsCards.first()).toBeVisible();

    // Check for either metrics data or empty state
    const hasMetrics = await page.locator('text=Total Events').isVisible();
    const hasEmptyState = await page.locator('text=No data yet').isVisible();

    expect(hasMetrics || hasEmptyState).toBeTruthy();

    // Step 8: Test refresh button
    const refreshButton = page.locator('button.refresh');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      // Wait a moment for refresh to complete
      await page.waitForTimeout(1000);
    }

    // Step 9: Test logout
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Step 10: Should redirect back to login
    await expect(page).toHaveURL('/login', { timeout: 5_000 });
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[placeholder*="API Key"]', 'invalid_api_key');
    await page.fill('input[placeholder*="Passphrase"]', 'invalid_passphrase');

    // Try to login
    const loginButton = page.locator('button:has-text("Login")');
    await loginButton.click();

    // Should show error message
    await expect(page.locator('.error, [class*="error"]')).toBeVisible({ timeout: 5_000 });
  });

  test('navigation between pages works', async ({ page }) => {
    await page.goto('/about');

    // Navigate to home (should redirect to login)
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/login');

    // Navigate back to about
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL('/about');
  });
});
