# Deno run_checks_and_e2e helper

What this does
- Runs `deno fmt` for the repository.
- Runs `deno check` on the Deno services (auth/demo, collector, dashboard/backend). The script avoids using the global `--unstable` flag on Deno v2+ to prevent warnings.
- Executes the shell-based e2e helper: `scripts/e2e_test.sh` (this posts a sample event, queries collector metrics).

Important separation (Deno vs Node)
- This Deno script intentionally does NOT run `npm` or any Node-based tooling. Keep Deno tasks (format, check, Deno-based tests) in Deno.
- Run Node-based tools (Playwright) separately inside the `dashboard/frontend` folder using Node/npm. This avoids cross-runtime permission and environment issues.

How to run the Deno checks + shell e2e helper

```bash
deno run --allow-run --allow-read --allow-env scripts/deno/run_checks_and_e2e.ts
```

How to run Playwright (Node) tests — DO THIS SEPARATELY

```bash
cd dashboard/frontend
npm install --save-dev @playwright/test
npx playwright install
npm run test:e2e
```

Permissions required for the Deno script
- --allow-run : spawn deno/shell processes
- --allow-read : read files (the script and helper scripts)
- --allow-env : read environment variables (optional flags)

Notes
- The script will attempt to detect your Deno major version and will avoid the global `--unstable` flag on Deno v2+ to prevent warnings. If detection fails it will fall back to using `--unstable`.
- If you'd like a single orchestration layer (for CI), consider adding a small CI script that runs Deno steps and then, in a separate step, runs Node/Playwright steps — keeping them separate avoids runtime mixing.
# Deno run_checks_and_e2e helper

What this does
- Runs `deno fmt` for the repository.
- Runs `deno check` on the Deno services (auth/demo, collector, dashboard/backend). The script avoids using the global `--unstable` flag on Deno v2+ to prevent warnings.
- Executes the shell-based e2e helper: `scripts/e2e_test.sh` (this posts a sample event, queries collector metrics).
- Optionally runs the frontend Playwright tests via npm when `RUN_BROWSER_E2E=true`.

How to run

From the repository root run:

```bash
deno run --allow-run --allow-read --allow-env scripts/deno/run_checks_and_e2e.ts
```

To also run the Node/browser E2E step (requires Playwright and browser binaries installed in `dashboard/frontend`):

```bash
RUN_BROWSER_E2E=true deno run --allow-run --allow-read --allow-env scripts/deno/run_checks_and_e2e.ts
```

Permissions required
- --allow-run : spawn deno/npm/shell processes
- --allow-read : read files (the script and helper scripts)
- --allow-env : read environment variable `RUN_BROWSER_E2E`

Notes
- The script tries to detect your Deno major version. If it finds Deno v2+ it will omit the global `--unstable` flag when calling `deno check` to avoid warnings. If detection fails it will fall back to passing `--unstable`.
- Playwright step is optional. If you plan to run it, first install dev deps in `dashboard/frontend`:

```bash
cd dashboard/frontend
npm install --save-dev @playwright/test
npx playwright install
```

If you'd like, I can also add a lightweight Node-based runner that wraps the Playwright invocation to be executed directly from Deno using `deno run --allow-run`.
