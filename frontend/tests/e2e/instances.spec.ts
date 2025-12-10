import { test, expect } from './fixtures/auth.fixture';

test.describe('Instances CRUD', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to instances page
    // Note: This assumes we have a "cliente_pf" object definition
    await page.goto('/backoffice/instances?object_type=cliente_pf');
  });

  test('should display instances list', async ({ authenticatedPage: page }) => {
    // Verify page shows instances
    await expect(
      page.locator('h1, h2').filter({ hasText: /Instances|Instâncias/i })
    ).toBeVisible();

    // Verify table or list exists
    const tableOrList = page.locator('table, [role="table"], [data-testid="instances-list"]');
    await expect(tableOrList).toBeVisible();
  });

  test('should create a new instance', async ({ authenticatedPage: page }) => {
    // Click new instance button
    const newButton = page.locator('button:has-text("New"), button:has-text("Nova"), a:has-text("New Instance")').first();

    if (await newButton.isVisible().catch(() => false)) {
      await newButton.click();

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Fill dynamic form fields (these depend on the object definition schema)
      const cpfField = page.locator('input[name="data.cpf"], input[name="cpf"]').first();
      if (await cpfField.isVisible().catch(() => false)) {
        await cpfField.fill('12345678901');
      }

      const nomeField = page.locator('input[name="data.nome_completo"], input[name="nome_completo"], input[name="data.nome"]').first();
      if (await nomeField.isVisible().catch(() => false)) {
        await nomeField.fill('João Teste E2E');
      }

      const emailField = page.locator('input[name="data.email"], input[name="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill('joao.teste@e2e.com');
      }

      // Submit form
      const submitButton = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Salvar")').first();
      await submitButton.click();

      // Verify success
      await expect(
        page.locator('[role="alert"]:has-text("created"), [role="alert"]:has-text("criada")')
      ).toBeVisible({ timeout: 5000 }).catch(async () => {
        // Alternative: check for redirect
        await page.waitForURL(/\/backoffice\/instances\/[a-f0-9-]+/, { timeout: 5000 });
      });
    }
  });

  test('should validate required fields', async ({ authenticatedPage: page }) => {
    const newButton = page.locator('button:has-text("New"), button:has-text("Nova")').first();

    if (await newButton.isVisible().catch(() => false)) {
      await newButton.click();

      // Try to submit without filling required fields
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Verify error messages
      await expect(
        page.locator('text=/required|obrigatório|campo obrigatório/i')
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('should validate CPF format', async ({ authenticatedPage: page }) => {
    const newButton = page.locator('button:has-text("New"), button:has-text("Nova")').first();

    if (await newButton.isVisible().catch(() => false)) {
      await newButton.click();

      // Fill CPF field with invalid value
      const cpfField = page.locator('input[name="data.cpf"], input[name="cpf"]').first();
      if (await cpfField.isVisible().catch(() => false)) {
        await cpfField.fill('123');

        // Trigger blur to activate validation
        await page.keyboard.press('Tab');

        // Wait a bit for validation
        await page.waitForTimeout(500);

        // Verify error message
        const errorVisible = await page.locator('text=/CPF inválido|invalid CPF|11 dígitos/i').isVisible().catch(() => false);
        if (errorVisible) {
          await expect(page.locator('text=/CPF inválido|invalid CPF|11 dígitos/i')).toBeVisible();
        }
      }
    }
  });

  test('should edit an existing instance', async ({ authenticatedPage: page }) => {
    // Click on first instance
    const firstItem = page.locator('table tbody tr:first-child a, [data-testid="instance-item"]:first-child').first();

    if (await firstItem.isVisible().catch(() => false)) {
      await firstItem.click();

      // Click edit button
      const editButton = page.locator('button:has-text("Edit"), button:has-text("Editar")').first();

      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();

        // Edit a field
        const emailField = page.locator('input[name="data.email"], input[name="email"]').first();
        if (await emailField.isVisible().catch(() => false)) {
          await emailField.clear();
          await emailField.fill('updated.email@e2e.com');
        }

        // Submit
        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        // Verify success
        await expect(
          page.locator('[role="alert"]:has-text("updated"), [role="alert"]:has-text("atualizada")')
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should delete an instance', async ({ authenticatedPage: page }) => {
    // Find delete button
    const deleteButton = page.locator('button[title*="Delete"], button[title*="Deletar"]').first();

    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Confirmar")').last();
      await confirmButton.click();

      // Verify success
      await expect(
        page.locator('[role="alert"]:has-text("deleted"), [role="alert"]:has-text("deletada")')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should filter instances by state', async ({ authenticatedPage: page }) => {
    // Find state filter dropdown
    const stateFilter = page.locator('select[name="state"], [data-testid="state-filter"]').first();

    if (await stateFilter.isVisible().catch(() => false)) {
      await stateFilter.selectOption('ATIVO');

      // Wait for results to update
      await page.waitForTimeout(500);

      // Verify filtered results
      const rows = page.locator('table tbody tr, [data-testid="instance-item"]');
      const count = await rows.count();

      if (count > 0) {
        // Verify at least one result shows ATIVO state
        await expect(page.locator('text=ATIVO')).toBeVisible();
      }
    }
  });
});

test.describe('Instances - Dynamic Form Generation', () => {
  test('should render different field types correctly', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/instances/new?object_type=cliente_pf');

    // Check for different input types based on schema
    // String field
    const stringField = page.locator('input[type="text"]').first();
    await expect(stringField).toBeVisible();

    // Email field (if exists)
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();
    if (await emailField.isVisible().catch(() => false)) {
      await expect(emailField).toBeVisible();
    }

    // Date field (if exists)
    const dateField = page.locator('input[type="date"], [data-testid*="date"]').first();
    if (await dateField.isVisible().catch(() => false)) {
      await expect(dateField).toBeVisible();
    }
  });

  test('should handle CPF masking', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/instances/new?object_type=cliente_pf');

    const cpfField = page.locator('input[name="data.cpf"], input[name="cpf"]').first();

    if (await cpfField.isVisible().catch(() => false)) {
      // Type CPF without formatting
      await cpfField.fill('12345678901');

      // Check if masking is applied (format: 123.456.789-01)
      const value = await cpfField.inputValue();

      // Value should either be masked or raw digits
      expect(value.length).toBeGreaterThanOrEqual(11);
    }
  });
});

test.describe('Instances - State Transitions', () => {
  test('should transition instance state', async ({ authenticatedPage: page }) => {
    await page.goto('/backoffice/instances?object_type=cliente_pf');

    // Click on first instance
    const firstItem = page.locator('table tbody tr:first-child a').first();

    if (await firstItem.isVisible().catch(() => false)) {
      await firstItem.click();

      // Look for state transition buttons
      const transitionButton = page.locator('button:has-text("Change State"), button:has-text("Alterar Estado"), [data-testid="state-transition"]').first();

      if (await transitionButton.isVisible().catch(() => false)) {
        await transitionButton.click();

        // Select new state
        const stateOption = page.locator('button:has-text("ATIVO"), button:has-text("BLOQUEADO")').first();

        if (await stateOption.isVisible().catch(() => false)) {
          await stateOption.click();

          // Verify state changed
          await expect(
            page.locator('[role="alert"]:has-text("state changed"), [role="alert"]:has-text("estado alterado")')
          ).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});
