# Tracker — Environment

The tracker is a small client-side library. It doesn't require server-side
environment variables to run in-browser, but the project includes an example
`.env.example` for build-time defaults.

Copy `tracker/.env.example` to `tracker/.env` to customize the default
`TRACKER_ENDPOINT` used during local builds or testing.

Build:

```bash
# bundle tracker to single JS file
deno bundle tracker/index.ts tracker/build/tracker.js
```
