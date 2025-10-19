# 4Insights Dashboard Backend (BFF)

A lightweight, dependency-free backend for the SvelteKit dashboard built with Deno's standard library.

Responsibilities:
- Receives requests from the frontend
- Validates tokens with the Auth service (`/demo/verify`)
- Extracts the API key from the token
- Queries the Collector for metrics (filtering by API key in a future update)
- Returns data to the frontend

## Quick Start

```bash
# From repository root
cd dashboard-backend
DASHBOARD_BACKEND_PORT=8010 AUTH_BASE_URL=http://localhost:8001 \
  COLLECTOR_BASE_URL=http://localhost:8000 \
  deno run --allow-net --allow-env main.ts
```

Routes:
- GET /health – Health check
- GET /dashboard/metrics – Metrics proxy (requires `Authorization: Bearer <token>`)

## Environment Variables
- DASHBOARD_BACKEND_PORT (default: 8010)
- AUTH_BASE_URL (default: http://localhost:8001)
- COLLECTOR_BASE_URL (default: http://localhost:8000)

## Structure
```
/dashboard-backend
├── main.ts
├── services/
│   ├── AuthClient.ts
│   └── MetricsService.ts
└── utils/
    └── Config.ts
```

## Notes
- Persistence in Auth and Collector will be introduced later.
- Collector filtering by API key can be added when supported; the service already accepts the key.

