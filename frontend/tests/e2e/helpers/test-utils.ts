import { Page, expect } from '@playwright/test';

/**
 * Helper utilities for E2E tests
 */

/**
 * Wait for element with timeout and graceful fallback
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' }
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, {
      timeout: options?.timeout || 5000,
      state: options?.state || 'visible',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Click element if visible, otherwise skip
 */
export async function clickIfVisible(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector).first();
  const isVisible = await element.isVisible().catch(() => false);

  if (isVisible) {
    await element.click();
    return true;
  }

  return false;
}

/**
 * Fill field if visible, otherwise skip
 */
export async function fillIfVisible(
  page: Page,
  selector: string,
  value: string
): Promise<boolean> {
  const element = page.locator(selector).first();
  const isVisible = await element.isVisible().catch(() => false);

  if (isVisible) {
    await element.fill(value);
    return true;
  }

  return false;
}

/**
 * Wait for navigation or timeout
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: RegExp | string,
  timeout = 5000
): Promise<boolean> {
  try {
    await page.waitForURL(urlPattern, { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear and fill input field
 */
export async function clearAndFill(page: Page, selector: string, value: string): Promise<void> {
  const input = page.locator(selector).first();
  await input.clear();
  await input.fill(value);
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingComplete(page: Page, timeout = 10000): Promise<void> {
  // Wait for common loading indicators to disappear
  const loadingSelectors = [
    '[data-testid="loading"]',
    '.loading',
    '.spinner',
    '[aria-label*="loading"]',
    'text=/loading|carregando/i',
  ];

  for (const selector of loadingSelectors) {
    const element = page.locator(selector).first();
    const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);

    if (isVisible) {
      await element.waitFor({ state: 'hidden', timeout });
      break;
    }
  }

  // Also wait for network to be idle
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
}

/**
 * Verify success notification appears
 */
export async function expectSuccessNotification(page: Page, message?: string): Promise<void> {
  const notification = page.locator(
    '[role="alert"]:has-text("success"), [role="alert"]:has-text("sucesso"), .toast:has-text("success")'
  );

  await expect(notification).toBeVisible({ timeout: 5000 });

  if (message) {
    await expect(notification).toContainText(message, { ignoreCase: true });
  }
}

/**
 * Verify error notification appears
 */
export async function expectErrorNotification(page: Page, message?: string): Promise<void> {
  const notification = page.locator(
    '[role="alert"]:has-text("error"), [role="alert"]:has-text("erro"), .toast:has-text("error")'
  );

  await expect(notification).toBeVisible({ timeout: 5000 });

  if (message) {
    await expect(notification).toContainText(message, { ignoreCase: true });
  }
}

/**
 * Generate random test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return {
    email: `test-${timestamp}-${random}@example.com`,
    name: `Test User ${timestamp}`,
    cpf: generateCPF(),
    cnpj: generateCNPJ(),
    phone: `11${timestamp.toString().slice(-8)}`,
    timestamp,
    random,
  };
}

/**
 * Generate valid CPF (Brazilian ID)
 */
export function generateCPF(): string {
  const n = () => Math.floor(Math.random() * 9);
  const digits = [n(), n(), n(), n(), n(), n(), n(), n(), n()];

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const check1 = 11 - (sum % 11);
  digits.push(check1 >= 10 ? 0 : check1);

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  const check2 = 11 - (sum % 11);
  digits.push(check2 >= 10 ? 0 : check2);

  return digits.join('');
}

/**
 * Generate valid CNPJ (Brazilian company ID)
 */
export function generateCNPJ(): string {
  const n = () => Math.floor(Math.random() * 9);
  const digits = [n(), n(), n(), n(), n(), n(), n(), n(), 0, 0, 0, 1];

  // Calculate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  const check1 = 11 - (sum % 11);
  digits.push(check1 >= 10 ? 0 : check1);

  // Calculate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i];
  }
  const check2 = 11 - (sum % 11);
  digits.push(check2 >= 10 ? 0 : check2);

  return digits.join('');
}

/**
 * Format CPF (123.456.789-01)
 */
export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Format CNPJ (12.345.678/0001-90)
 */
export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Hide dynamic elements to reduce visual test flakiness
 */
export async function hideDynamicElements(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      [data-testid="timestamp"],
      .timestamp,
      time,
      [data-dynamic="true"],
      .last-updated,
      .created-at {
        visibility: hidden !important;
      }
    `,
  });
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
}

/**
 * Take debug screenshot
 */
export async function takeDebugScreenshot(
  page: Page,
  name: string,
  options?: { fullPage?: boolean }
): Promise<void> {
  await page.screenshot({
    path: `test-results/debug-${name}-${Date.now()}.png`,
    fullPage: options?.fullPage ?? true,
  });
}

/**
 * Get table row count
 */
export async function getTableRowCount(page: Page, tableSelector = 'table'): Promise<number> {
  return await page.locator(`${tableSelector} tbody tr`).count();
}

/**
 * Click table row by index
 */
export async function clickTableRow(
  page: Page,
  rowIndex: number,
  tableSelector = 'table'
): Promise<void> {
  const row = page.locator(`${tableSelector} tbody tr`).nth(rowIndex);
  await row.click();
}

/**
 * Search in table
 */
export async function searchTable(page: Page, query: string): Promise<void> {
  const searchInput = page.locator(
    'input[type="search"], input[placeholder*="Search"], input[placeholder*="Buscar"]'
  ).first();

  await searchInput.fill(query);
  await page.waitForTimeout(600); // Debounce
}

/**
 * Verify table contains text
 */
export async function expectTableContains(
  page: Page,
  text: string,
  tableSelector = 'table'
): Promise<void> {
  const table = page.locator(tableSelector);
  await expect(table).toContainText(text);
}

/**
 * Login helper (without fixture)
 */
export async function login(
  page: Page,
  email?: string,
  password?: string
): Promise<void> {
  await page.goto('/');

  const isAuthenticated = await page.locator('[data-testid="user-menu"]')
    .isVisible()
    .catch(() => false);

  if (!isAuthenticated) {
    const loginButton = page.locator('button:has-text("Login"), a:has-text("Login")').first();

    if (await loginButton.isVisible().catch(() => false)) {
      await loginButton.click();
      await page.waitForTimeout(1000);

      const usernameField = page.locator('input[name="username"], input[type="email"]');
      const passwordField = page.locator('input[name="password"], input[type="password"]');

      if (await usernameField.isVisible().catch(() => false)) {
        await usernameField.fill(email || process.env.TEST_USER_EMAIL || 'admin@supercore.com');
        await passwordField.fill(password || process.env.TEST_USER_PASSWORD || 'admin123');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL(/\/(dashboard|backoffice)/, { timeout: 10000 }).catch(() => {});
      }
    }
  }
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  const userMenu = page.locator('[data-testid="user-menu"]').first();

  if (await userMenu.isVisible().catch(() => false)) {
    await userMenu.click();

    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    await logoutButton.click();

    await page.waitForURL(/\/(login|auth)/, { timeout: 5000 }).catch(() => {});
  }
}
