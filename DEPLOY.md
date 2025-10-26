# Deploying 4Insights (quick guide)

This file contains quick, pragmatic instructions to deploy the development MVP
of 4Insights using Docker (recommended for parity) and using serverless
platforms (Render/Vercel) for the frontend/back-end components.

IMPORTANT: The frontend Docker image expects a bundled tracker at
`tracker/build/tracker.js`. The project now bundles the tracker in the frontend
image build, so no pre-commit of generated bundles is required.

## Prerequisites

- Docker and docker-compose installed (for containerized flow)
- For local dev: Deno (v2.x+ recommended), Node.js (>=18), npm
- You will supply environment variables (per-service). See below.

## Environment variables (example)

You'll provide env variables or .env file on the hosting platforms. The
important variables are:

- Dashboard backend (Deno):
  - DASHBOARD_BACKEND_PORT (default 8010)
  - AUTH_BASE_URL (e.g. http://auth:8001)
  - COLLECTOR_BASE_URL (e.g. http://collector:8000)

- Auth demo (Deno):
  - DEMO_AUTH_PORT (default 8001)

- Frontend (Vite/SvelteKit):
  - VITE_DASHBOARD_BACKEND_URL (e.g. https://your-backend.example.com)
  - VITE_AUTH_SERVICE_URL
  - VITE_COLLECTOR_URL

## Docker (recommended for testing & preview)

From the repository root:

```bash
# Build images (the frontend image will bundle the tracker during build)
docker compose build

# Start services in foreground
docker compose up

# Or run in detached mode
# docker compose up -d
```

After startup:

- Frontend: http://localhost:5173
- Collector: http://localhost:8000
- Auth demo: http://localhost:8001
- Backend: http://localhost:8010

## Deploying to Render (containers)

- Create a new Web Service for each component (frontend, backend, collector,
  auth)
- Use the Dockerfile in `docker/` for each service. Set the Build Command to
  `docker build -t service-name .` if needed or attach the repo and point to
  each Dockerfile.
- Set environment variables in Render's dashboard per service using the env
  names above.
- Ensure ports and health checks match (backend health at `/health`, auth
  `/health`).

Notes for Render:

- Use a persistent disk or managed volume for the Collector data if you need
  persistence.
- The frontend image builds the tracker during build and serves static files via
  nginx.

## Deploying frontend to Vercel (static)

Vercel is a good fit for the frontend static site. The backend and collector
must be deployed separately (Render or other). Steps:

1. Build locally or in CI: `npm run build` in `dashboard/frontend`.
2. Upload/Deploy the built `build/` directory to Vercel as a static site.
3. Configure environment variables on Vercel as `VITE_...` values.

If you prefer to use the Docker image for the frontend on Render or another
host, the Dockerfile is ready and will produce a static site served by nginx.

## CI / E2E

- Playwright tests are in `dashboard/frontend/tests`. To run locally:

```bash
cd dashboard/frontend
npm install
npx playwright install
npm run test:e2e
```
