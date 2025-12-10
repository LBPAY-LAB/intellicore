# E2E Tests with Playwright

Comprehensive end-to-end tests for the SuperCore application using Playwright.

## Overview

This test suite covers:

- **Object Definitions**: CRUD operations, schema validation, search
- **Instances**: Dynamic form generation, validation, state transitions
- **Assistant**: Natural language object creation flow
- **RAG**: Query system, SQL/Graph queries, context retrieval
- **Visual Regression**: Screenshot-based UI testing

## Setup

### Prerequisites

- Node.js 20+
- Running backend (Go API on port 8080)
- Running frontend (Next.js on port 3000)
- PostgreSQL database

### Installation

```bash
cd frontend
npm install
npx playwright install
npx playwright install-deps
```

### Environment Variables

Copy `.env.test` and adjust if needed:

```bash
cp .env.test .env.test.local
```

Key variables:
- `TEST_USER_EMAIL`: Test user email (default: admin@supercore.com)
- `TEST_USER_PASSWORD`: Test user password (default: admin123)
- `PLAYWRIGHT_BASE_URL`: Frontend URL (default: http://localhost:3000)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8080)

## Running Tests

### All Tests

```bash
npm run test:e2e
```

### Specific Test File

```bash
npx playwright test object-definitions.spec.ts
```

### Interactive UI Mode

```bash
npm run test:e2e:ui
```

### Debug Mode

```bash
npm run test:e2e:debug
```

### Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

### Fixtures

**auth.fixture.ts**
- Provides authenticated page context
- Handles Keycloak login flow
- Reusable across all test files

### Test Files

**object-definitions.spec.ts**
- Create, read, update, delete object definitions
- Schema validation
- Search functionality
- Required field validation

**instances.spec.ts**
- CRUD operations for instances
- Dynamic form validation
- CPF/email format validation
- State transitions
- Filtering

**assistant.spec.ts**
- Natural language conversation flow
- Multi-step object creation
- Message history
- Preview functionality
- Error handling

**rag.spec.ts**
- SQL queries
- Graph relationship queries
- Aggregations
- Loading states
- Error handling
- Performance testing

**visual.spec.ts**
- Screenshot-based regression testing
- Responsive design validation
- Dark mode testing
- Component state testing

## Writing New Tests

### Using Authentication Fixture

```typescript
import { test, expect } from './fixtures/auth.fixture';

test('my test', async ({ authenticatedPage: page }) => {
  await page.goto('/my-route');
  // Test logic here
});
```

### Best Practices

1. **Use data-testid attributes** for stable selectors:
   ```tsx
   <button data-testid="submit-button">Submit</button>
   ```

   ```typescript
   await page.click('[data-testid="submit-button"]');
   ```

2. **Wait for network idle** on page loads:
   ```typescript
   await page.goto('/route');
   await page.waitForLoadState('networkidle');
   ```

3. **Use graceful fallbacks** for optional elements:
   ```typescript
   const element = page.locator('.optional-element');
   if (await element.isVisible().catch(() => false)) {
     await element.click();
   }
   ```

4. **Hide dynamic content** in visual tests:
   ```typescript
   await page.addStyleTag({
     content: `
       .timestamp { visibility: hidden !important; }
     `
   });
   ```

5. **Use meaningful assertions**:
   ```typescript
   // Good
   await expect(page.locator('h1')).toContainText('Dashboard');

   // Avoid
   expect(true).toBe(true);
   ```

## Viewing Test Results

### HTML Report

After tests run:

```bash
npm run test:e2e:report
```

### CI/CD Reports

Reports are uploaded as artifacts in GitHub Actions:
- `playwright-report`: HTML report
- `playwright-videos`: Video recordings of failures

## Debugging Failing Tests

### 1. Run in Debug Mode

```bash
npx playwright test --debug object-definitions.spec.ts
```

### 2. View Trace

```bash
npx playwright show-trace trace.zip
```

### 3. Enable Screenshots

Screenshots are automatically taken on failure. Find them in:
```
test-results/
```

### 4. Enable Videos

Videos are recorded on failure. Check:
```
test-results/
```

### 5. Slow Motion

```bash
npx playwright test --headed --slow-mo=1000
```

## Visual Regression Testing

### Update Snapshots

When UI changes are intentional:

```bash
npx playwright test --update-snapshots
```

### Compare Specific Test

```bash
npx playwright test visual.spec.ts --update-snapshots
```

### Review Differences

Failed visual tests show diffs in the HTML report.

## Performance Testing

### Timeout Configuration

Default timeout: 30s per test

Adjust in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 10000, // 10s for actions
},
timeout: 60000, // 60s per test
```

### Measuring Performance

```typescript
test('performance test', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/route');
  await page.waitForLoadState('networkidle');

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000); // Under 3s
});
```

## Continuous Integration

Tests run automatically on:
- Push to `main` or `dev` branches
- Pull requests to `main`

See `.github/workflows/e2e-tests.yml`

### Local CI Simulation

```bash
# Start services
docker-compose up -d

# Run tests
npm run test:e2e

# Cleanup
docker-compose down
```

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check environment variables
- Ensure database is seeded correctly
- Verify backend is running on correct port

### Tests Are Flaky

- Add explicit waits: `await page.waitForTimeout(500)`
- Use `waitForLoadState('networkidle')`
- Increase timeouts for slow operations
- Hide dynamic elements in visual tests

### Authentication Fails

- Check `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`
- Verify Keycloak is running
- Check if user exists in database
- Review `auth.fixture.ts` logic

### Playwright Not Installed

```bash
npx playwright install --with-deps
```

### Port Already in Use

- Stop existing processes on ports 3000/8080
- Or change ports in `.env.test`

## Coverage Goals

Target coverage:
- [ ] Critical user flows: 100%
- [ ] CRUD operations: 100%
- [ ] Form validation: 90%
- [ ] Error states: 80%
- [ ] Visual regression: Key pages

## Roadmap

- [ ] Add API testing with Playwright
- [ ] Implement load testing
- [ ] Add accessibility testing (axe-core)
- [ ] Mobile app testing (if applicable)
- [ ] Cross-browser matrix expansion
- [ ] Parallel test execution optimization

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)

## Support

For issues or questions:
1. Check this README
2. Review Playwright docs
3. Check test failure screenshots/videos
4. Ask the team in #testing channel
