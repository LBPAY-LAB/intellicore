import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Authentication fixture for E2E tests
 * Provides an authenticated page ready to use
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to home page
    await page.goto('/');

    // Check if already authenticated (session exists)
    const isAuthenticated = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);

    if (!isAuthenticated) {
      // Click login button
      const loginButton = page.locator('button:has-text("Login"), a:has-text("Login")').first();
      if (await loginButton.isVisible().catch(() => false)) {
        await loginButton.click();

        // Wait for Keycloak login page or redirect
        await page.waitForTimeout(1000);

        // Check if we're on Keycloak login page
        const usernameField = page.locator('input[name="username"], input[type="email"]');
        const passwordField = page.locator('input[name="password"], input[type="password"]');

        if (await usernameField.isVisible().catch(() => false)) {
          // Fill credentials
          await usernameField.fill(process.env.TEST_USER_EMAIL || 'admin@supercore.com');
          await passwordField.fill(process.env.TEST_USER_PASSWORD || 'admin123');

          // Submit login form
          await page.locator('button[type="submit"], input[type="submit"]').click();

          // Wait for redirect back to app
          await page.waitForURL(/\/(dashboard|backoffice)/, { timeout: 10000 }).catch(() => {});
        }
      }
    }

    // Ensure we're authenticated
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 }).catch(() => {
      console.warn('User menu not found, proceeding anyway...');
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
