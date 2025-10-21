# Node CI runner

This small Node script starts the Deno services and the frontend dev server,
waits until they respond, then runs the Playwright tests (Node-side). It's
intended for CI where a single job can start processes.

Usage (on CI):

```bash
node scripts/node/run_playwright_ci.js
```

Requirements:

- Node.js installed (for runner and Playwright)
- Playwright installed in `dashboard/frontend`
  (`npm install --save-dev @playwright/test` and `npx playwright install`)

Notes:

- The script uses only Node built-ins and `node-fetch` if the Node environment
  doesn't already provide `fetch` (CI images typically do). If `node-fetch` is
  not available, the script will still attempt to use global fetch.
