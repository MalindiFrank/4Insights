# Deno run_checks_and_e2e helper

What this does

- Runs `deno fmt` for the repository.
- Runs `deno check` on the Deno services (auth/demo, collector,
  dashboard/backend). The script avoids using the global `--unstable` flag on
  Deno v2+ to prevent warnings.
- Executes the shell-based e2e helper: `scripts/e2e_test.sh` (this posts a
  sample event, queries collector metrics).

Important separation (Deno vs Node)

- This Deno script intentionally does NOT run `npm` or any Node-based tooling.
  Keep Deno tasks (format, check, Deno-based tests) in Deno.
- Run Node-based tools (Playwright) separately inside the `dashboard/frontend`
  folder using Node/npm. This avoids cross-runtime permission and environment
  issues.

How to run the Deno verification flow (Deno-only)

This repository prefers Deno v2+ for all services except the Dashboard frontend.
The scripts in `scripts/deno` are Deno-first and should be used to verify the
codebase before building Docker images.

1. Quick verification (format, check, bundle tracker):

```bash
deno run --allow-read --allow-write --allow-run scripts/deno/verify_all.ts
```

2. Verify everything including the frontend build (invokes npm via
   Deno.Command):

```bash
deno run --allow-read --allow-write --allow-run scripts/deno/verify_all.ts --with-frontend
```

What `verify_all.ts` does

- Runs `deno fmt` on the repo
- Runs `deno check` on the Deno services: `auth/demo/server`, `collector`,
  `dashboard/backend`
- Bundles the tracker using the Deno-only bundler at `tracker/build.ts` (outputs
  `tracker/build/tracker.js` by default)
- Optionally invokes the frontend `npm ci` and `npm run build` from
  `dashboard/frontend` when `--with-frontend` is passed

Notes and rationale

- The `verify_all.ts` script uses Deno.Command (Deno 2+ compatible) to
  orchestrate commands and keeps the orchestration in Deno. It only invokes npm
  when explicitly requested (and still from Deno), honoring the project's
  preference that scripts be Deno-first.
- Use `tracker/build.ts` (Deno-only) for generating the browser bundle used by
  the static frontend image. This avoids committing generated artifacts into
  source control.
