# 4Insights — Development Guide

This document summarizes the minimal, repeatable steps for local development and
CI. It keeps Deno and Node responsibilities separate and provides quick commands
to run the services, tests, and CI.

Quick Summary

- Backend services (auth, collector, dashboard/backend) run on Deno.
- Frontend (SvelteKit) runs on Node (npm / Vite).
- Browser E2E tests use Playwright (Node). Keep Playwright and Node tooling in
  `dashboard/frontend`.

Quick start (local)

1. Start Deno services (auth, collector, backend). From repo root:

```bash
# starts auth, collector and backend in background, and frontend in foreground
make start-all
```

2. Or run them individually:

```bash
# auth
cd auth/demo/server && deno run --allow-net --allow-env main.ts &
# collector
cd collector && deno run --allow-net --allow-read --allow-write main.ts &
# dashboard backend
cd dashboard/backend && deno run --allow-net --allow-env main.ts &
# frontend (in its own terminal)
cd dashboard/frontend && npm install && npm run dev
```

Playwright E2E (Node) — run separately

```bash
cd dashboard/frontend
npm install --save-dev @playwright/test
npx playwright install
npm run test:e2e
```

Deno helper script

- `scripts/deno/run_checks_and_e2e.ts` — runs `deno fmt`, `deno check` on Deno
  services and the shell e2e helper `scripts/e2e_test.sh`. It intentionally does
  not call npm.

Node CI runner

- `scripts/node/run_playwright_ci.js` — starts Deno services and frontend, waits
  for readiness, then runs Playwright tests. Designed to be executed in CI only
  (Node runtime). See `scripts/node/README.md` for details.

CI (GitHub Actions)

- `.github/workflows/ci.yml` contains two jobs:
  - `deno-checks`: checkout + setup deno + run `deno fmt` and `deno check` on
    services
  - `playwright-e2e`: runs in a Node environment, installs frontend deps and
    runs `scripts/node/run_playwright_ci.js`

Developer notes and tips

- Keep the runtimes separate: Deno scripts, checks and services remain in Deno.
  Node-based tools (Playwright, Vite) remain in `dashboard/frontend`.
- For quick manual E2E verification use `scripts/e2e_test.sh` — it posts a
  fully-formed pageview event and queries collector + backend metrics.
- To run everything in one terminal for development, use `make dev-tmux`
  (requires `tmux`) — this will manage panes for each service.

Troubleshooting

- If Playwright tests fail locally, ensure browsers are installed:
  `npx playwright install`.
- If Deno reports unstable flag warnings, upgrade to Deno 2+ or run the Deno
  helper which avoids the global `--unstable` flag when possible.
