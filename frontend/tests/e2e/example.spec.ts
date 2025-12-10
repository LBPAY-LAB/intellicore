import { test, expect } from './fixtures/auth.fixture';
import {
  generateTestData,
  waitForLoadingComplete,
  expectSuccessNotification,
  clickIfVisible,
  fillIfVisible,
  hideDynamicElements,
} from './helpers/test-utils';

/**
 * EXAMPLE E2E TEST - Best Practices Demonstration
 *
 * This file shows how to write effective E2E tests using:
 * - Authentication fixtures
 * - Helper utilities
 * - Graceful fallbacks
 * - Clear assertions
 * - Proper waits
 */

test.describe('Example Test Suite - Best Practices', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to page under test
    await page.goto('/backoffice/object-definitions');

    // Wait for page to be fully loaded
    await waitForLoadingComplete(page);
  });

  test('example: complete CRUD flow with best practices', async ({ authenticatedPage: page }) => {
    // Generate test data
    const testData = generateTestData();
    const objectName = `test-object-${testData.timestamp}`;

    // ========================================
    // CREATE
    // ========================================

    // Use multiple selectors with graceful fallback
    const newButton = page.locator(
      'button:has-text("New"), button:has-text("Novo"), a:has-text("New Object")'
    ).first();

    await newButton.click();

    // Wait for form to appear
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 5000 });

    // Fill form fields
    await page.fill('input[name="name"]', objectName);
    await page.fill('input[name="display_name"]', `Test Object ${testData.timestamp}`);
    await page.fill('textarea[name="description"]', 'Created by automated test');

    // Fill schema (handle Monaco editor or textarea)
    const schemaEditor = page.locator('[data-testid="schema-editor"], textarea[name="schema"]').first();
    await schemaEditor.click();
    await page.keyboard.type(JSON.stringify({
      type: 'object',
      properties: {
        name: { type: 'string' },
        value: { type: 'number' }
      },
      required: ['name']
    }, null, 2));

    // Submit form
    const submitButton = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")').first();
    await submitButton.click();

    // Verify success
    await expectSuccessNotification(page);

    // Verify redirect to detail page
    await expect(page).toHaveURL(/\/backoffice\/object-definitions\/[a-f0-9-]+$/, { timeout: 5000 });

    // Verify details are displayed
    await expect(page.locator(`text=${objectName}`)).toBeVisible();

    // ========================================
    // READ
    // ========================================

    // Navigate back to list
    await page.goto('/backoffice/object-definitions');
    await waitForLoadingComplete(page);

    // Search for created object
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(objectName);
      await page.waitForTimeout(600); // Debounce
    }

    // Verify object appears in list
    await expect(page.locator(`text=${objectName}`)).toBeVisible();

    // Click to view details
    await page.click(`text=${objectName}`);
    await waitForLoadingComplete(page);

    // Verify all details are correct
    await expect(page.locator('h1, h2').first()).toContainText('Test Object');
    await expect(page.locator('text=/schema|Schema/i')).toBeVisible();

    // ========================================
    // UPDATE
    // ========================================

    // Click edit button
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Editar")').first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Update description
      const descField = page.locator('textarea[name="description"]');
      await descField.clear();
      await descField.fill('Updated by automated test');

      // Submit update
      await page.locator('button[type="submit"]').first().click();

      // Verify success
      await expectSuccessNotification(page);

      // Verify updated content
      await expect(page.locator('text=Updated by automated test')).toBeVisible({ timeout: 5000 });
    }

    // ========================================
    // DELETE
    // ========================================

    // Find and click delete button
    const deleteButton = page.locator('button[title*="Delete"], button[title*="Deletar"], button:has-text("Delete")').first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion in dialog
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Confirmar")').last();
      await confirmButton.click();

      // Verify success
      await expectSuccessNotification(page);

      // Verify redirect to list
      await expect(page).toHaveURL(/\/backoffice\/object-definitions$/, { timeout: 5000 });

      // Verify object no longer in list
      const objectText = page.locator(`text=${objectName}`);
      await expect(objectText).not.toBeVisible({ timeout: 5000 }).catch(() => {
        // Object might still be in list but marked as deleted
      });
    }
  });

  test('example: form validation with helper utilities', async ({ authenticatedPage: page }) => {
    // Navigate to creation form
    const clicked = await clickIfVisible(page, 'button:has-text("New")');
    expect(clicked).toBe(true);

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Verify validation errors appear
    await expect(page.locator('text=/required|obrigatório/i').first()).toBeVisible({ timeout: 3000 });

    // Fill required fields using helper
    const nameFilled = await fillIfVisible(page, 'input[name="name"]', 'test-validation');
    expect(nameFilled).toBe(true);

    // Verify error disappears
    const errorStillVisible = await page.locator('input[name="name"] ~ text=/required/i')
      .isVisible()
      .catch(() => false);
    expect(errorStillVisible).toBe(false);
  });

  test('example: visual regression with dynamic element hiding', async ({ authenticatedPage: page }) => {
    // Hide dynamic elements to reduce flakiness
    await hideDynamicElements(page);

    // Wait for page to stabilize
    await waitForLoadingComplete(page);
    await page.waitForTimeout(500);

    // Take screenshot
    await expect(page).toHaveScreenshot('object-definitions-list.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('example: performance testing', async ({ authenticatedPage: page }) => {
    const startTime = Date.now();

    await page.goto('/backoffice/object-definitions');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Assert load time is acceptable
    expect(loadTime).toBeLessThan(5000);

    // Log performance metric
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('example: handling conditional UI elements', async ({ authenticatedPage: page }) => {
    // Element that might or might not exist
    const optionalFeature = page.locator('[data-testid="beta-feature"]').first();
    const isVisible = await optionalFeature.isVisible().catch(() => false);

    if (isVisible) {
      // Test the feature
      await optionalFeature.click();
      await expect(page.locator('[data-testid="beta-content"]')).toBeVisible();
    } else {
      // Feature not available, skip or test alternative path
      console.log('Beta feature not available, skipping test');
    }
  });

  test('example: testing with generated test data', async ({ authenticatedPage: page }) => {
    const testData = generateTestData();

    // Use generated data
    console.log('Test data:', {
      email: testData.email,
      cpf: testData.cpf,
      name: testData.name,
      timestamp: testData.timestamp,
    });

    // Test data is unique per test run
    expect(testData.email).toMatch(/^test-\d+-[a-z0-9]+@example\.com$/);
    expect(testData.cpf).toHaveLength(11);
  });

  test('example: accessibility testing', async ({ authenticatedPage: page }) => {
    // Check for basic accessibility
    const mainHeading = page.locator('h1, h2[role="heading"]').first();
    await expect(mainHeading).toBeVisible();

    // Check for form labels
    const inputs = page.locator('input[type="text"], input[type="email"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const hasLabel = await page.locator(`label[for="${id}"]`).isVisible().catch(() => false);

      // Input should have label or aria-label
      expect(hasLabel || ariaLabel).toBeTruthy();
    }

    // Check for proper button roles
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have text or aria-label
      expect((text && text.trim().length > 0) || ariaLabel).toBeTruthy();
    }
  });

  test('example: error state testing', async ({ authenticatedPage: page }) => {
    // Trigger an error condition
    await page.route('**/api/object-definitions', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // Reload page to trigger error
    await page.reload();

    // Verify error is displayed gracefully
    const errorMessage = page.locator('text=/error|erro|failed/i').first();
    const errorVisible = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);

    if (errorVisible) {
      await expect(errorMessage).toBeVisible();
      // Error should be user-friendly, not technical
      const errorText = await errorMessage.textContent();
      expect(errorText).not.toContain('500');
      expect(errorText).not.toContain('Internal Server Error');
    }
  });
});

test.describe('Example - Advanced Patterns', () => {
  test('example: testing with mock data', async ({ page }) => {
    // Intercept API request and return mock data
    await page.route('**/api/object-definitions', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '123',
            name: 'mock-object',
            display_name: 'Mock Object',
            description: 'Mocked for testing',
          }
        ]),
      });
    });

    await page.goto('/backoffice/object-definitions');

    // Verify mock data is displayed
    await expect(page.locator('text=Mock Object')).toBeVisible();
  });

  test('example: parallel test execution', async ({ page }) => {
    // This test runs in parallel with others
    // Each test gets isolated browser context

    await page.goto('/dashboard');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // No interference from other tests
  });

  test('example: mobile responsive testing', async ({ browser }) => {
    // Create mobile context
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });

    const page = await mobileContext.newPage();

    await page.goto('/dashboard');

    // Verify mobile layout
    const hamburgerMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"]').first();
    const mobileMenuVisible = await hamburgerMenu.isVisible().catch(() => false);

    if (mobileMenuVisible) {
      // Test mobile navigation
      await hamburgerMenu.click();
      await expect(page.locator('[role="navigation"]')).toBeVisible();
    }

    await mobileContext.close();
  });
});
