import { test, expect } from '@playwright/test';

test.describe('oraclemanagement page', () => {
  test('should load page successfully', async ({ page }) => {
    await page.goto('/oraclemanagement');
    await expect(page).toHaveTitle(/oraclemanagement/i);
  });

  test('should render main component', async ({ page }) => {
    await page.goto('/oraclemanagement');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});
