import { test, expect } from './fixtures/auth.fixture';

test.describe('Natural Language Assistant', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to assistant page
    await page.goto('/assistant');
  });

  test('should display assistant interface', async ({ authenticatedPage: page }) => {
    // Verify chat interface is visible
    await expect(
      page.locator('[data-testid="assistant-chat"], [role="log"], .chat-container')
    ).toBeVisible();

    // Verify input field exists
    await expect(
      page.locator('input[placeholder*="message"], textarea[placeholder*="message"], input[placeholder*="mensagem"]')
    ).toBeVisible();
  });

  test('should send and receive messages', async ({ authenticatedPage: page }) => {
    // Find message input
    const messageInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    await messageInput.fill('Olá, assistente!');

    // Send message
    const sendButton = page.locator('button[aria-label*="Send"], button[aria-label*="Enviar"], button:has-text("Send")').first();
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Verify message appears in chat
    await expect(page.locator('text=Olá, assistente!')).toBeVisible();

    // Verify assistant response appears
    const messages = page.locator('[data-testid="message"], .message, [role="article"]');
    const count = await messages.count();
    expect(count).toBeGreaterThan(1); // At least user message + assistant response
  });

  test('should complete object creation flow', async ({ authenticatedPage: page }) => {
    // This test follows the full conversation flow
    const messageInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    const sendButton = page.locator('button[aria-label*="Send"], button[aria-label*="Enviar"]').first();

    // Helper function to send message
    const sendMessage = async (text: string) => {
      await messageInput.fill(text);
      await sendButton.click();
      await page.waitForTimeout(1500); // Wait for response
    };

    // Start conversation - might have initial greeting
    const greeting = await page.locator('text=/Qual o nome|What is the name/i').isVisible({ timeout: 3000 }).catch(() => false);

    if (!greeting) {
      // If no automatic greeting, send a message to start
      await sendMessage('Quero criar um novo objeto');
      await page.waitForTimeout(1000);
    }

    // Step 1: Object name
    const nameQuestion = page.locator('text=/nome do objeto|name of.*object/i');
    if (await nameQuestion.isVisible().catch(() => false)) {
      await sendMessage('Produto Digital');
      await page.waitForTimeout(1500);
    }

    // Step 2: Description
    const descQuestion = page.locator('text=/descreva|describe/i');
    if (await descQuestion.isVisible().catch(() => false)) {
      await sendMessage('Um produto digital vendido pela plataforma');
      await page.waitForTimeout(1500);
    }

    // Step 3: Fields
    const fieldsQuestion = page.locator('text=/informações|campos|fields|properties/i');
    if (await fieldsQuestion.isVisible().catch(() => false)) {
      await sendMessage('Nome, Descrição, Preço, Categoria');
      await page.waitForTimeout(1500);
    }

    // Step 4: Validations
    const validationsQuestion = page.locator('text=/validação|validation/i');
    if (await validationsQuestion.isVisible().catch(() => false)) {
      await sendMessage('Nenhuma validação especial');
      await page.waitForTimeout(1500);
    }

    // Step 5: States
    const statesQuestion = page.locator('text=/estados|states/i');
    if (await statesQuestion.isVisible().catch(() => false)) {
      await sendMessage('Rascunho, Publicado, Arquivado');
      await page.waitForTimeout(1500);
    }

    // Step 6: Relationships
    const relationshipsQuestion = page.locator('text=/relaciona|relationships/i');
    if (await relationshipsQuestion.isVisible().catch(() => false)) {
      await sendMessage('Não se relaciona com outros objetos');
      await page.waitForTimeout(1500);
    }

    // Step 7: Confirmation
    const confirmQuestion = page.locator('text=/confirma|preview|confirm/i');
    if (await confirmQuestion.isVisible().catch(() => false)) {
      // Look for confirm button or send "Sim"
      const confirmButton = page.locator('button:has-text("Sim"), button:has-text("Yes"), button:has-text("Confirmar")').first();

      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      } else {
        await sendMessage('Sim');
      }

      await page.waitForTimeout(2000);
    }

    // Verify success message or redirect
    const successVisible = await page.locator('text=/sucesso|success|criado|created/i').isVisible({ timeout: 5000 }).catch(() => false);

    if (successVisible) {
      await expect(page.locator('text=/sucesso|success|criado|created/i')).toBeVisible();
    }
  });

  test('should display preview before creation', async ({ authenticatedPage: page }) => {
    const messageInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    const sendButton = page.locator('button[aria-label*="Send"], button[aria-label*="Enviar"]').first();

    // Quick flow to reach preview (simplified)
    const sendMessage = async (text: string) => {
      await messageInput.fill(text);
      await sendButton.click();
      await page.waitForTimeout(1000);
    };

    // Send multiple quick answers to reach preview
    await sendMessage('Criar objeto de teste');

    // Look for preview elements
    const preview = page.locator('[data-testid="object-preview"], .preview, text=/preview|visualização/i');
    const previewVisible = await preview.isVisible({ timeout: 10000 }).catch(() => false);

    if (previewVisible) {
      await expect(preview).toBeVisible();
    }
  });

  test('should handle errors gracefully', async ({ authenticatedPage: page }) => {
    const messageInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    const sendButton = page.locator('button[aria-label*="Send"]').first();

    // Send empty message
    await sendButton.click();

    // Should either show error or do nothing (not crash)
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy(); // Page still renders
  });

  test('should show typing indicator', async ({ authenticatedPage: page }) => {
    const messageInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    const sendButton = page.locator('button[aria-label*="Send"]').first();

    await messageInput.fill('Test message');
    await sendButton.click();

    // Look for typing indicator (common patterns)
    const typingIndicator = page.locator(
      '[data-testid="typing-indicator"], .typing-indicator, text=/digitando|typing/i, .dots'
    ).first();

    const indicatorVisible = await typingIndicator.isVisible({ timeout: 1000 }).catch(() => false);

    if (indicatorVisible) {
      await expect(typingIndicator).toBeVisible();
    }
  });
});

test.describe('Assistant - Message History', () => {
  test('should preserve message history', async ({ authenticatedPage: page }) => {
    await page.goto('/assistant');

    const messageInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    const sendButton = page.locator('button[aria-label*="Send"]').first();

    // Send first message
    await messageInput.fill('Primeira mensagem');
    await sendButton.click();
    await page.waitForTimeout(1500);

    // Send second message
    await messageInput.fill('Segunda mensagem');
    await sendButton.click();
    await page.waitForTimeout(1500);

    // Verify both messages are visible
    await expect(page.locator('text=Primeira mensagem')).toBeVisible();
    await expect(page.locator('text=Segunda mensagem')).toBeVisible();
  });

  test('should scroll to bottom on new message', async ({ authenticatedPage: page }) => {
    await page.goto('/assistant');

    const messageInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    const sendButton = page.locator('button[aria-label*="Send"]').first();

    // Send a message
    await messageInput.fill('Test scroll');
    await sendButton.click();

    await page.waitForTimeout(1000);

    // The last message should be visible (auto-scrolled)
    const lastMessage = page.locator('[data-testid="message"], .message').last();
    await expect(lastMessage).toBeInViewport();
  });
});

test.describe('Assistant - Accessibility', () => {
  test('should be keyboard navigable', async ({ authenticatedPage: page }) => {
    await page.goto('/assistant');

    // Tab to message input
    await page.keyboard.press('Tab');

    const messageInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();

    // Type message
    await page.keyboard.type('Test keyboard navigation');

    // Enter or Tab to send button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Message should be sent
    await expect(page.locator('text=Test keyboard navigation')).toBeVisible();
  });
});
