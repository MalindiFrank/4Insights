# 4Insights Collector

Dependency-free Deno service that receives events from the tracker, stores them, and exposes aggregated metrics for the dashboard backend (BFF).

## Features
- Append-only NDJSON event storage (file-based)
- CORS enabled
- API key scoping via `X-API-Key`
- Metrics endpoint for totals and top paths

## Quick Start
```bash
# From repository root
deno run --allow-net --allow-read --allow-write collector/main.ts
```

- Collect events (POST): `/4insights/collect` or `/4insights/batch`
  - Headers: `Content-Type: application/json`, optional `X-API-Key: <apiKey>`
  - Body: JSON array of events
- Metrics (GET): `/4insights/metrics`
  - Optional header `X-API-Key` to scope metrics

## API Key Scoping
- Incoming events are enriched and stored with `_apiKey` when `X-API-Key` is provided
- Metrics requests use `X-API-Key` to filter data per key

## Storage
- Events at `./data/events.ndjson`
- Sites registry at `./data/sites.json`

## Notes
- Suitable for development and small deployments. For production, consider a database-backed store and rate limiting.


