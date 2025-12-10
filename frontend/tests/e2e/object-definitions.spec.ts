import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Object Definitions CRUD
 */

test.describe('Object Definitions CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/backoffice/object-definitions');
  });

  test('should display object definitions list', async ({ page }) => {
    await page.waitForSelector('h1:has-text("Object Definitions")');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('button:has-text("New Object")')).toBeVisible();
  });

  test('should create a new object definition', async ({ page }) => {
    await page.click('button:has-text("New Object")');
    await page.waitForSelector('h1:has-text("Create Object Definition")');

    await page.fill('#name', 'test_object');
    await page.fill('#displayName', 'Test Object');
    await page.fill('#description', 'Test description');

    await page.click('button:has-text("Create")');
    await page.waitForSelector('h1:has-text("Test Object")');
  });
})
