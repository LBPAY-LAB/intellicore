import { test, expect } from './fixtures/auth.fixture';

/**
 * Smoke Tests - Quick validation of critical functionality
 * These tests run fast and verify the app is basically working
 */

test.describe('Smoke Tests', () => {
  test('application loads successfully', async ({ page }) => {
    await page.goto('/');

    // Verify page loads (no crash)
    await expect(page).toHaveTitle(/SuperCore|LBPAY/i);

    // Verify no critical errors in console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Should not have critical errors after load
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('404'))).toHaveLength(0);
  });

  test('backend API is accessible', async ({ page }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const response = await page.request.get(`${apiUrl}/health`).catch(() =>
      page.request.get(`${apiUrl}/api/health`)
    );

    expect(response?.ok()).toBeTruthy();
  });

  test('can navigate to key pages', async ({ authenticatedPage: page }) => {
    // Dashboard
    await page.goto('/dashboard');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Object Definitions
    await page.goto('/backoffice/object-definitions');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Instances
    await page.goto('/backoffice/instances');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Assistant
    await page.goto('/assistant');
    await expect(page.locator('input, textarea').first()).toBeVisible();

    // RAG
    await page.goto('/rag');
    await expect(page.locator('textarea, input').first()).toBeVisible();
  });

  test('object definitions list loads', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/object-definitions');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Verify table or list is present
    const tableOrList = page.locator('table, [role="table"], [data-testid="object-definitions-list"]');
    await expect(tableOrList).toBeVisible({ timeout: 5000 });
  });

  test('instances list loads', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/instances');

    await page.waitForLoadState('networkidle');

    // Should have some UI (even if empty state)
    const content = page.locator('table, [data-testid="instances-list"], text=/no instances|nenhuma instância/i');
    await expect(content.first()).toBeVisible({ timeout: 5000 });
  });

  test('assistant interface is interactive', async ({ authenticatedPage: page }) => {
    await page.goto('/assistant');

    // Verify input is enabled
    const input = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Verify send button exists
    const sendButton = page.locator('button[aria-label*="Send"], button:has-text("Send")').first();
    await expect(sendButton).toBeVisible();
  });

  test('RAG query interface is interactive', async ({ authenticatedPage: page }) => {
    await page.goto('/rag');

    // Verify query input is enabled
    const input = page.locator('textarea[placeholder*="pergunta"], textarea[placeholder*="question"]').first();
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Verify submit button exists
    const submitButton = page.locator('button:has-text("Query"), button:has-text("Consultar")').first();
    await expect(submitButton).toBeVisible();
  });

  test('can create object definition (basic flow)', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/object-definitions');

    const newButton = page.locator('button:has-text("New"), button:has-text("Novo")').first();

    if (await newButton.isVisible().catch(() => false)) {
      await newButton.click();

      // Verify form loads
      await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 3000 });
    }
  });

  test('no JavaScript errors on page load', async ({ page }) => {
    const jsErrors: string[] = [];

    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should have no uncaught JS errors
    expect(jsErrors).toHaveLength(0);
  });

  test('responsive design works on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE
    });
    const page = await context.newPage();

    await page.goto('/dashboard');

    // Verify page renders without layout issues
    const body = page.locator('body');
    const boundingBox = await body.boundingBox();

    expect(boundingBox?.width).toBeLessThanOrEqual(375);

    await context.close();
  });

  test('database connection is working', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/object-definitions');

    // Try to load data from database
    await page.waitForLoadState('networkidle');

    // If we can see the page without errors, DB is connected
    const pageContent = await page.content();
    expect(pageContent).not.toContain('Database connection failed');
    expect(pageContent).not.toContain('500');
  });

  test('authentication system is working', async ({ page }) => {
    await page.goto('/dashboard');

    // Should either show login or be authenticated
    const isAuthPage = page.url().includes('/login') || page.url().includes('/auth');
    const hasUserMenu = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);

    expect(isAuthPage || hasUserMenu).toBeTruthy();
  });
});

test.describe('Smoke Tests - Performance', () => {
  test('dashboard loads within acceptable time', async ({ authenticatedPage: page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('object definitions page loads within acceptable time', async ({ authenticatedPage: page }) => {
    const startTime = Date.now();

    await page.goto('/backoffice/object-definitions');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('Smoke Tests - Security', () => {
  test('protected routes require authentication', async ({ browser }) => {
    const context = await browser.newContext({
      // No authentication
    });
    const page = await context.newPage();

    await page.goto('/backoffice/object-definitions');

    // Should redirect to login or show auth required
    await page.waitForTimeout(2000);

    const url = page.url();
    const hasLoginForm = await page.locator('input[type="password"]').isVisible().catch(() => false);

    expect(url.includes('/login') || url.includes('/auth') || hasLoginForm).toBeTruthy();

    await context.close();
  });

  test('no sensitive data in client-side code', async ({ page }) => {
    await page.goto('/');

    const content = await page.content();

    // Should not contain common secrets
    expect(content).not.toContain('secret_key');
    expect(content).not.toContain('private_key');
    expect(content).not.toContain('api_secret');
    expect(content).not.toMatch(/password.*=.*['"][^'"]+['"]/i);
  });
});
