# E2E Tests - Quick Start Guide

## 5-Minute Setup

### 1. Install (First Time Only)

```bash
cd frontend
npm install
npx playwright install
```

### 2. Start Services

**Option A - Docker (Recommended):**
```bash
# From project root
docker-compose up -d
```

**Option B - Manual:**
```bash
# Terminal 1 - Backend
cd backend
go run cmd/api/main.go

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Verify Setup

```bash
./tests/e2e/verify-setup.sh
```

### 4. Run Tests

```bash
# Smoke tests (2 minutes)
npx playwright test smoke.spec.ts

# All tests (~8 minutes parallel)
npm run test:e2e

# Interactive UI (recommended)
npm run test:e2e:ui
```

## Common Commands

```bash
# Run specific test file
npx playwright test object-definitions.spec.ts

# Run tests matching pattern
npx playwright test --grep "create"

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npm run test:e2e:debug

# View last report
npm run test:e2e:report

# Update visual snapshots
npx playwright test visual.spec.ts --update-snapshots
```

## Test Suites

| Suite | Tests | Duration | Purpose |
|-------|-------|----------|---------|
| smoke.spec.ts | 15 | ~2 min | Quick validation |
| object-definitions.spec.ts | 8 | ~3 min | CRUD operations |
| instances.spec.ts | 9 | ~4 min | Instance management |
| assistant.spec.ts | 7 | ~5 min | NL interface |
| rag.spec.ts | 10 | ~4 min | Query system |
| visual.spec.ts | 12 | ~3 min | UI regression |

## Troubleshooting

### Tests Won't Start

```bash
# Check services
curl http://localhost:8080/health  # Backend
curl http://localhost:3000         # Frontend

# If not running, start them (see step 2 above)
```

### Tests Fail Immediately

```bash
# Re-install Playwright browsers
npx playwright install --with-deps

# Clear cache
rm -rf node_modules/.cache
```

### Authentication Issues

Check credentials in `.env.test`:
```env
TEST_USER_EMAIL=admin@supercore.com
TEST_USER_PASSWORD=admin123
```

### Visual Tests Fail

```bash
# Update snapshots if UI changed intentionally
npx playwright test visual.spec.ts --update-snapshots
```

## Next Steps

- Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
- Read [README.md](./README.md) for writing tests
- Check [E2E_TEST_IMPLEMENTATION.md](../../E2E_TEST_IMPLEMENTATION.md) for overview

## Support

1. Check documentation above
2. Review test failure screenshots in `test-results/`
3. Ask team in #testing channel

## Tips

- Use interactive UI mode (`npm run test:e2e:ui`) for development
- Run smoke tests before committing (`npx playwright test smoke.spec.ts`)
- Check CI results in GitHub Actions
- Keep snapshots updated as UI evolves
