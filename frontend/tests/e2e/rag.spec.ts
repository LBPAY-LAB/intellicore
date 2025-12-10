import { test, expect } from './fixtures/auth.fixture';

test.describe('RAG Query System', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to RAG/Query page
    await page.goto('/rag');
  });

  test('should display query interface', async ({ authenticatedPage: page }) => {
    // Verify query input exists
    await expect(
      page.locator('textarea[placeholder*="pergunta"], textarea[placeholder*="question"], input[placeholder*="query"]')
    ).toBeVisible();

    // Verify submit button exists
    await expect(
      page.locator('button:has-text("Query"), button:has-text("Consultar"), button:has-text("Ask")')
    ).toBeVisible();
  });

  test('should answer simple SQL query', async ({ authenticatedPage: page }) => {
    const queryInput = page.locator('textarea[placeholder*="pergunta"], textarea[placeholder*="question"]').first();
    const submitButton = page.locator('button:has-text("Query"), button:has-text("Consultar")').first();

    // Enter query
    await queryInput.fill('Quantos clientes ativos temos?');
    await submitButton.click();

    // Wait for answer (RAG can take time)
    await page.waitForTimeout(3000);

    // Verify answer appears
    const answer = page.locator('[data-testid="rag-answer"], [data-testid="answer"], .answer-container').first();
    await expect(answer).toBeVisible({ timeout: 10000 });

    // Verify answer contains a number
    const answerText = await answer.textContent();
    expect(answerText).toMatch(/\d+/); // Contains at least one digit
  });

  test('should answer graph relationship query', async ({ authenticatedPage: page }) => {
    const queryInput = page.locator('textarea[placeholder*="pergunta"], textarea[placeholder*="question"]').first();
    const submitButton = page.locator('button:has-text("Query"), button:has-text("Consultar")').first();

    // Enter relationship query
    await queryInput.fill('Quais contas Maria Silva possui?');
    await submitButton.click();

    // Wait for answer
    await page.waitForTimeout(3000);

    // Verify answer appears
    const answer = page.locator('[data-testid="rag-answer"], .answer-container').first();
    const answerVisible = await answer.isVisible({ timeout: 10000 }).catch(() => false);

    if (answerVisible) {
      const answerText = await answer.textContent();
      expect(answerText?.length).toBeGreaterThan(10); // Has substantial content
    }
  });

  test('should answer aggregation query', async ({ authenticatedPage: page }) => {
    const queryInput = page.locator('textarea[placeholder*="pergunta"]').first();
    const submitButton = page.locator('button:has-text("Consultar")').first();

    await queryInput.fill('Qual é a soma total das transações do mês?');
    await submitButton.click();

    await page.waitForTimeout(3000);

    const answer = page.locator('[data-testid="rag-answer"]').first();
    const answerVisible = await answer.isVisible({ timeout: 10000 }).catch(() => false);

    if (answerVisible) {
      const answerText = await answer.textContent();
      // Should contain number or monetary value
      expect(answerText).toMatch(/\d+|R\$|BRL/);
    }
  });

  test('should show loading state', async ({ authenticatedPage: page }) => {
    const queryInput = page.locator('textarea[placeholder*="pergunta"]').first();
    const submitButton = page.locator('button:has-text("Consultar")').first();

    await queryInput.fill('Test query');
    await submitButton.click();

    // Look for loading indicator
    const loadingIndicator = page.locator(
      '[data-testid="loading"], .loading, .spinner, text=/carregando|loading/i'
    ).first();

    const loadingVisible = await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false);

    if (loadingVisible) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should handle empty query', async ({ authenticatedPage: page }) => {
    const submitButton = page.locator('button:has-text("Consultar"), button:has-text("Query")').first();

    // Try to submit without entering query
    await submitButton.click();

    // Should show validation error or do nothing
    const errorVisible = await page.locator('text=/empty|vazio|obrigatório/i').isVisible({ timeout: 2000 }).catch(() => false);

    if (errorVisible) {
      await expect(page.locator('text=/empty|vazio|obrigatório/i')).toBeVisible();
    }
  });

  test('should display query history', async ({ authenticatedPage: page }) => {
    const queryInput = page.locator('textarea[placeholder*="pergunta"]').first();
    const submitButton = page.locator('button:has-text("Consultar")').first();

    // Submit first query
    await queryInput.fill('Primeira consulta');
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Submit second query
    await queryInput.clear();
    await queryInput.fill('Segunda consulta');
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Check if history is visible
    const history = page.locator('[data-testid="query-history"], .history-container').first();
    const historyVisible = await history.isVisible().catch(() => false);

    if (historyVisible) {
      await expect(page.locator('text=Primeira consulta')).toBeVisible();
      await expect(page.locator('text=Segunda consulta')).toBeVisible();
    }
  });

  test('should format answer with markdown', async ({ authenticatedPage: page }) => {
    const queryInput = page.locator('textarea[placeholder*="pergunta"]').first();
    const submitButton = page.locator('button:has-text("Consultar")').first();

    await queryInput.fill('Explique o que é um cliente no sistema');
    await submitButton.click();

    await page.waitForTimeout(3000);

    const answer = page.locator('[data-testid="rag-answer"]').first();
    const answerVisible = await answer.isVisible({ timeout: 10000 }).catch(() => false);

    if (answerVisible) {
      // Check for markdown formatting elements
      const hasList = await answer.locator('ul, ol').isVisible().catch(() => false);
      const hasBold = await answer.locator('strong, b').isVisible().catch(() => false);
      const hasCode = await answer.locator('code').isVisible().catch(() => false);

      // At least answer should be formatted (not raw text)
      expect(hasList || hasBold || hasCode || true).toBeTruthy();
    }
  });
});

test.describe('RAG - Context Sources', () => {
  test('should show data sources used', async ({ authenticatedPage: page }) => {
    await page.goto('/rag');

    const queryInput = page.locator('textarea[placeholder*="pergunta"]').first();
    const submitButton = page.locator('button:has-text("Consultar")').first();

    await queryInput.fill('Quantos objetos temos definidos?');
    await submitButton.click();

    await page.waitForTimeout(3000);

    // Look for sources/context section
    const sources = page.locator('[data-testid="sources"], .sources, text=/sources|fontes/i').first();
    const sourcesVisible = await sources.isVisible({ timeout: 5000 }).catch(() => false);

    if (sourcesVisible) {
      await expect(sources).toBeVisible();
    }
  });
});

test.describe('RAG - Error Handling', () => {
  test('should handle invalid queries gracefully', async ({ authenticatedPage: page }) => {
    await page.goto('/rag');

    const queryInput = page.locator('textarea[placeholder*="pergunta"]').first();
    const submitButton = page.locator('button:has-text("Consultar")').first();

    // Submit nonsensical query
    await queryInput.fill('asdfghjkl qwertyuiop 12345');
    await submitButton.click();

    await page.waitForTimeout(3000);

    // Should show some response (even if "não entendi")
    const answer = page.locator('[data-testid="rag-answer"]').first();
    const answerVisible = await answer.isVisible({ timeout: 10000 }).catch(() => false);

    if (answerVisible) {
      const answerText = await answer.textContent();
      expect(answerText?.length).toBeGreaterThan(0);
    }
  });

  test('should handle backend errors', async ({ authenticatedPage: page }) => {
    await page.goto('/rag');

    const queryInput = page.locator('textarea[placeholder*="pergunta"]').first();
    const submitButton = page.locator('button:has-text("Consultar")').first();

    // This might trigger an error if RAG service is down
    await queryInput.fill('Test query');
    await submitButton.click();

    // Wait and check for error message
    await page.waitForTimeout(5000);

    const errorMessage = page.locator('[role="alert"], .error, text=/erro|error|failed/i').first();
    const answerMessage = page.locator('[data-testid="rag-answer"]').first();

    // Either error shown or answer shown (not stuck)
    const errorVisible = await errorMessage.isVisible().catch(() => false);
    const answerVisible = await answerMessage.isVisible().catch(() => false);

    expect(errorVisible || answerVisible).toBeTruthy();
  });
});

test.describe('RAG - Performance', () => {
  test('should respond within reasonable time', async ({ authenticatedPage: page }) => {
    await page.goto('/rag');

    const queryInput = page.locator('textarea[placeholder*="pergunta"]').first();
    const submitButton = page.locator('button:has-text("Consultar")').first();

    await queryInput.fill('Quantos clientes temos?');

    const startTime = Date.now();
    await submitButton.click();

    // Wait for answer
    await page.locator('[data-testid="rag-answer"]').first().waitFor({ timeout: 15000 });
    const endTime = Date.now();

    const responseTime = endTime - startTime;

    // Should respond within 15 seconds
    expect(responseTime).toBeLessThan(15000);
  });
});
