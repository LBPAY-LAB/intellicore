import { test, expect } from './fixtures/auth.fixture';

/**
 * Visual Regression Tests
 * These tests capture screenshots and compare them to baseline images
 * Run with --update-snapshots flag to update baselines
 */

test.describe('Visual Regression - Key Pages', () => {
  test('dashboard should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Hide dynamic elements (timestamps, etc) to reduce flakiness
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .timestamp,
        time {
          visibility: hidden !important;
        }
      `
    });

    // Take screenshot
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow small differences
    });
  });

  test('object definitions list should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/object-definitions');
    await page.waitForLoadState('networkidle');

    // Hide timestamps
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .timestamp,
        time {
          visibility: hidden !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('object-definitions-list.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('instances list should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/instances');
    await page.waitForLoadState('networkidle');

    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .timestamp,
        time {
          visibility: hidden !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('instances-list.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('assistant interface should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/assistant');
    await page.waitForLoadState('networkidle');

    // Wait for initial assistant message
    await page.waitForTimeout(1000);

    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .timestamp,
        time {
          visibility: hidden !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('assistant-interface.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('RAG query interface should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/rag');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('rag-interface.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});

test.describe('Visual Regression - Components', () => {
  test('new object definition form should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/object-definitions/new');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('object-definition-form.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('new instance form should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/instances/new?object_type=cliente_pf');
    await page.waitForLoadState('networkidle');

    // Wait for dynamic form to render
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('instance-form.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});

test.describe('Visual Regression - Dark Mode', () => {
  test.skip('dashboard in dark mode should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // Toggle dark mode (implementation depends on your app)
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"], button[aria-label*="dark"]').first();
    const toggleVisible = await darkModeToggle.isVisible().catch(() => false);

    if (toggleVisible) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('dashboard-dark.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    }
  });
});

test.describe('Visual Regression - Responsive', () => {
  test('dashboard on mobile should match snapshot', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE
    });
    const page = await context.newPage();

    // Simple auth for mobile test
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });

    await context.close();
  });

  test('object definitions on tablet should match snapshot', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 }, // iPad
    });
    const page = await context.newPage();

    await page.goto('/backoffice/object-definitions');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('object-definitions-tablet.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });

    await context.close();
  });
});

test.describe('Visual Regression - States', () => {
  test('button hover states should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/object-definitions');

    const button = page.locator('button:has-text("New"), button:has-text("Novo")').first();
    await button.hover();

    await expect(button).toHaveScreenshot('button-hover.png', {
      maxDiffPixels: 50,
    });
  });

  test('form validation errors should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/object-definitions/new');

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for validation errors to appear
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('form-validation-errors.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});

test.describe('Visual Regression - Modals and Dialogs', () => {
  test('delete confirmation dialog should match snapshot', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/object-definitions');

    const deleteButton = page.locator('button[title*="Delete"], button[title*="Deletar"]').first();
    const deleteVisible = await deleteButton.isVisible().catch(() => false);

    if (deleteVisible) {
      await deleteButton.click();

      // Wait for dialog to appear
      await page.waitForTimeout(300);

      const dialog = page.locator('[role="dialog"], .modal').first();
      await expect(dialog).toHaveScreenshot('delete-dialog.png', {
        maxDiffPixels: 50,
      });
    }
  });
});
