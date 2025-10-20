# Collector — Environment

Environment variables used by the `collector` service.

Local development: copy `collector/.env.example` to `collector/.env` and adjust.

- COLLECTOR_PORT — port the collector HTTP server listens on (default: 8000)
- DATA_DIR — directory to store `events.ndjson` and `sites.json` (default
  `./data`)

Notes:

- The collector appends events to an NDJSON file for simplicity. For large-scale
  deployments use a proper database / blob store.
