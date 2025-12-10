# E2E Testing Setup Guide

Complete guide to set up and run E2E tests for SuperCore.

## Prerequisites

### System Requirements

- **Node.js**: 20.x or later
- **npm**: 10.x or later
- **Operating System**: macOS, Linux, or Windows
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 2GB for browsers

### Application Requirements

- **Backend API**: Running on `http://localhost:8080`
- **Frontend**: Running on `http://localhost:3000`
- **PostgreSQL**: Running on `localhost:5432`
- **Keycloak** (optional): Running on `http://localhost:8081`

## Installation

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Install Playwright Browsers

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers (~500MB).

### Step 3: Install System Dependencies

**Ubuntu/Debian:**
```bash
npx playwright install-deps
```

**macOS:**
```bash
# Usually works without additional deps
# If issues, install via brew:
brew install --cask playwright
```

**Windows:**
```bash
# Run as Administrator
npx playwright install-deps
```

### Step 4: Configure Environment

Copy test environment file:

```bash
cp .env.test .env.test.local
```

Edit `.env.test.local`:

```env
# Test credentials
TEST_USER_EMAIL=admin@supercore.com
TEST_USER_PASSWORD=admin123

# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081

# Frontend URL
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

## Starting Services

### Option 1: Docker Compose (Recommended)

```bash
cd /Users/jose.silva.lb/LBPay/supercore
docker-compose up -d
```

Wait for services to be ready:

```bash
# Check backend
curl http://localhost:8080/health

# Check frontend
curl http://localhost:3000

# Check database
docker-compose ps
```

### Option 2: Manual Start

**Terminal 1 - Database:**
```bash
docker run -d \
  --name supercore-db \
  -e POSTGRES_DB=supercore \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

**Terminal 2 - Backend:**
```bash
cd backend
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/supercore
go run cmd/api/main.go
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Verify Services

```bash
# Backend health
curl http://localhost:8080/health
# Should return: {"status":"ok"}

# Frontend
curl http://localhost:3000
# Should return HTML

# Database
psql -h localhost -U postgres -d supercore -c "SELECT 1;"
# Should return: 1
```

## Running Tests

### Quick Start - Smoke Tests

```bash
npm run test:e2e smoke.spec.ts
```

This runs ~15 quick tests to verify basic functionality.

### All Tests

```bash
npm run test:e2e
```

Expected duration: 5-10 minutes

### Specific Test File

```bash
npx playwright test object-definitions.spec.ts
```

### Interactive Mode (Recommended for Development)

```bash
npm run test:e2e:ui
```

This opens Playwright's UI where you can:
- Run individual tests
- See test execution in real-time
- Debug failures
- Record new tests

### Debug Mode

```bash
npm run test:e2e:debug
```

Runs tests with debugger attached. Execution pauses at breakpoints.

### Watch Mode

```bash
npx playwright test --watch
```

Reruns tests when files change.

### Headed Mode (See Browser)

```bash
npx playwright test --headed
```

Useful for debugging visual issues.

## Test Organization

```
tests/e2e/
├── fixtures/
│   └── auth.fixture.ts          # Authentication helper
├── helpers/
│   └── test-utils.ts            # Reusable utilities
├── object-definitions.spec.ts   # Object definitions CRUD
├── instances.spec.ts            # Instances CRUD
├── assistant.spec.ts            # NL assistant flow
├── rag.spec.ts                  # RAG query system
├── visual.spec.ts               # Visual regression
├── smoke.spec.ts                # Quick smoke tests
└── README.md                    # Test documentation
```

## Troubleshooting

### Tests Fail Immediately

**Problem**: `Error: page.goto: net::ERR_CONNECTION_REFUSED`

**Solution**: Verify frontend is running:
```bash
curl http://localhost:3000
```

If not running:
```bash
cd frontend
npm run dev
```

---

**Problem**: `Error: Timeout 30000ms exceeded`

**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 15000, // Increase from 10000
}
```

### Authentication Fails

**Problem**: Tests fail at login step

**Solutions**:

1. **Check credentials in `.env.test.local`**:
   ```env
   TEST_USER_EMAIL=admin@supercore.com
   TEST_USER_PASSWORD=admin123
   ```

2. **Verify user exists in database**:
   ```bash
   psql -h localhost -U postgres -d supercore
   SELECT email FROM users WHERE email = 'admin@supercore.com';
   ```

3. **Create test user** (if missing):
   ```bash
   cd backend
   go run cmd/seed/main.go --create-admin
   ```

4. **Check Keycloak configuration** (if using):
   - Verify Keycloak is running: `curl http://localhost:8081`
   - Check client configuration
   - Verify redirect URIs include `http://localhost:3000`

### Playwright Not Found

**Problem**: `npx: playwright command not found`

**Solution**:
```bash
npm install @playwright/test --save-dev
npx playwright install
```

### Browsers Not Installed

**Problem**: `Error: Executable doesn't exist at ...`

**Solution**:
```bash
npx playwright install
npx playwright install-deps  # On Linux
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:

**macOS/Linux**:
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

**Windows**:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Fails

**Problem**: Tests fail with database errors

**Solutions**:

1. **Check PostgreSQL is running**:
   ```bash
   docker ps | grep postgres
   ```

2. **Verify connection string**:
   ```bash
   psql postgresql://postgres:postgres@localhost:5432/supercore
   ```

3. **Run migrations**:
   ```bash
   cd backend
   go run cmd/migrate/main.go up
   ```

4. **Seed database** (if empty):
   ```bash
   go run cmd/seed/main.go
   ```

### Visual Tests Fail

**Problem**: Visual regression tests show differences

**Solutions**:

1. **Update snapshots** (if changes are intentional):
   ```bash
   npx playwright test visual.spec.ts --update-snapshots
   ```

2. **Review differences**:
   ```bash
   npx playwright show-report
   ```

3. **Increase tolerance** (in test file):
   ```typescript
   await expect(page).toHaveScreenshot('page.png', {
     maxDiffPixels: 200, // Increase from 100
   });
   ```

### Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solutions**:

1. **Add explicit waits**:
   ```typescript
   await page.waitForLoadState('networkidle');
   await page.waitForTimeout(500);
   ```

2. **Wait for specific elements**:
   ```typescript
   await page.waitForSelector('[data-testid="content"]');
   ```

3. **Increase timeouts**:
   ```typescript
   await expect(element).toBeVisible({ timeout: 10000 });
   ```

4. **Disable animations** (in visual tests):
   ```typescript
   await page.addStyleTag({
     content: '*, *::before, *::after { transition: none !important; animation: none !important; }'
   });
   ```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main` or `dev`
- Pull requests

View workflow: `.github/workflows/e2e-tests.yml`

### Local CI Simulation

```bash
# Start services
docker-compose up -d

# Wait for readiness
sleep 10

# Run tests
cd frontend
npm run test:e2e

# Cleanup
cd ..
docker-compose down
```

## Best Practices

### 1. Use data-testid for Selectors

**Good**:
```typescript
await page.click('[data-testid="submit-button"]');
```

**Avoid**:
```typescript
await page.click('.btn.btn-primary.submit-btn');
```

### 2. Wait for State, Not Time

**Good**:
```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="content"]');
```

**Avoid**:
```typescript
await page.waitForTimeout(5000);
```

### 3. Isolate Tests

Each test should:
- Be independent
- Clean up after itself
- Not rely on other tests

### 4. Use Fixtures

**Good**:
```typescript
import { test } from './fixtures/auth.fixture';

test('my test', async ({ authenticatedPage: page }) => {
  // Already authenticated
});
```

**Avoid**:
```typescript
test('my test', async ({ page }) => {
  // Manual login in every test
});
```

### 5. Handle Flakiness

- Add retries in config
- Use graceful fallbacks
- Hide dynamic content in visual tests

## Performance Optimization

### Parallel Execution

Run tests in parallel:

```bash
npx playwright test --workers=4
```

### Selective Testing

Run only changed tests:

```bash
npx playwright test --only-changed
```

### Sharding (CI)

Split tests across multiple machines:

```bash
# Machine 1
npx playwright test --shard=1/3

# Machine 2
npx playwright test --shard=2/3

# Machine 3
npx playwright test --shard=3/3
```

## Resources

- **Playwright Docs**: https://playwright.dev
- **Best Practices**: https://playwright.dev/docs/best-practices
- **API Reference**: https://playwright.dev/docs/api/class-test
- **Debugging Guide**: https://playwright.dev/docs/debug

## Support

For help:
1. Check this guide
2. Review test failure screenshots in `test-results/`
3. Check Playwright documentation
4. Ask team in #testing channel

## Quick Commands Reference

```bash
# Install
npm install
npx playwright install

# Run all tests
npm run test:e2e

# Run specific test
npx playwright test object-definitions.spec.ts

# Interactive UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Update snapshots
npx playwright test --update-snapshots

# View report
npm run test:e2e:report

# Headed mode
npx playwright test --headed

# Specific browser
npx playwright test --project=chromium

# Watch mode
npx playwright test --watch
```
