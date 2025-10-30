# 4Insights — Development Guide

This document summarizes the minimal, repeatable steps for local development and
CI. It keeps Deno and Node responsibilities separate and provides quick commands
to run the services, tests, and CI.

## Quick Summary

- **Backend services** (auth, collector, dashboard/backend) run on **Deno**
- **Frontend** (SvelteKit) runs on **Node** (npm / Vite)
- **Browser E2E tests** use Playwright (Node)
- **Configuration**: All services use runtime environment variables (see [CONFIGURATION.md](./CONFIGURATION.md))

## Quick Start (Local)

### 1. Set up environment variables

Copy `.env.example` to `.env` in each service directory:

```bash
cp auth/demo/server/.env.example auth/demo/server/.env
cp collector/.env.example collector/.env
cp dashboard/backend/.env.example dashboard/backend/.env
cp dashboard/frontend-new/.env.example dashboard/frontend-new/.env
```

Edit the `.env` files if you need to change default URLs or ports.

### 2. Start all services

**Option A: Using Make (recommended)**

```bash
# Starts auth, collector, backend in background, and frontend in foreground
make start-all
```

**Option B: Using tmux (for development)**

```bash
# Starts all services in separate tmux panes
make dev-tmux

# Attach to the session
tmux attach -t 4insights

# Stop the session
make stop-dev-tmux
```

**Option C: Run services individually**

```bash
# Auth service (terminal 1)
cd auth/demo/server && deno run --allow-net --allow-env main.ts

# Collector service (terminal 2)
cd collector && deno run --allow-net --allow-read --allow-write main.ts

# Dashboard backend (terminal 3)
cd dashboard/backend && deno run --allow-net --allow-env main.ts

# Frontend (terminal 4)
cd dashboard/frontend-new && npm install && npm run dev
```

### 3. Access the services

- **Frontend**: http://localhost:5173
- **Dashboard Backend**: http://localhost:8010
- **Auth Service**: http://localhost:8001
- **Collector**: http://localhost:8000

## Testing

### Playwright E2E Tests

The frontend includes end-to-end tests using Playwright:

```bash
cd dashboard/frontend-new
npm install --save-dev @playwright/test
npx playwright install
npm run test:e2e
```

### Deno Service Tests

Run tests for individual services:

```bash
# Auth service tests
cd auth/demo/server && deno test --allow-net --allow-env

# Collector tests
cd collector && deno test --allow-net --allow-read --allow-write

# Dashboard backend tests
cd dashboard/backend && deno test --allow-net --allow-env
```

### Comprehensive Verification

Run all checks and tests:

```bash
make verify
```

This runs:
- `deno fmt` (formatting)
- `deno check` (type checking)
- `deno lint` (linting)
- `deno test` (unit tests)
- `npm run check` (frontend type checking)

## CI/CD (GitHub Actions)

The repository includes a GitHub Actions workflow at `.github/workflows/verify.yml`:

**Jobs:**
1. **Deno Checks**: Runs `deno fmt`, `deno check`, and `deno lint` on all services
2. **Frontend Checks**: Runs `npm ci`, `npm run check` (svelte-check)
3. **Deno Verification**: Runs `make verify` to execute all tests

## Developer Notes and Tips

### Runtime Separation

- **Deno**: All backend services (auth, collector, dashboard/backend)
- **Node**: Frontend (SvelteKit), Playwright tests, build tools
- Keep tooling separate to avoid permission and environment issues

### Configuration

- All services use **runtime environment variables** (no build-time config)
- See [CONFIGURATION.md](./CONFIGURATION.md) for details
- Frontend loads config from `/api/config` endpoint at runtime

### Quick E2E Verification

Use the shell script for manual testing:

```bash
# Posts a pageview event and queries metrics
./scripts/e2e_test.sh
```

### Development Workflow

1. Start services with `make dev-tmux` or `make start-all`
2. Make changes to code
3. Services auto-reload (Deno watch mode, Vite HMR)
4. Run tests with `make verify`
5. Commit changes

## Troubleshooting

### Playwright tests fail

**Solution**: Ensure browsers are installed:
```bash
npx playwright install
```

### Deno unstable flag warnings

**Solution**: Upgrade to Deno 2+ or use the verification script:
```bash
deno run --allow-read --allow-write --allow-run scripts/deno/verify_all.ts
```

### Port already in use

**Solution**: Check for running processes:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Frontend can't connect to backend

**Solution**:
1. Verify all services are running
2. Check `.env` files have correct URLs
3. Check browser console for CORS errors
4. Verify backend is accessible: `curl http://localhost:8010/health`

### Environment variables not loading

**Solution**:
1. Ensure `.env` file exists in service directory
2. Restart the service
3. For frontend, hard refresh browser (Ctrl+Shift+R)
4. Check that variable names match `.env.example`
