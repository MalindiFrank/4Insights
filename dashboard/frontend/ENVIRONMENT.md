# Environment Configuration

## Frontend Environment Variables

Create a `.env` file in the `dashboard/frontend/` directory with the following variables:

```bash
# Dashboard Backend (BFF) URL
VITE_DASHBOARD_BACKEND_URL=http://localhost:8010

# Auth Service URL  
VITE_AUTH_SERVICE_URL=http://localhost:8001

# Collector API URL (for direct access if needed)
VITE_COLLECTOR_URL=http://localhost:8000
```

## Backend Environment Variables

For the dashboard backend, set these environment variables:

```bash
# Dashboard Backend Port
DASHBOARD_BACKEND_PORT=8010

# Auth Service URL
AUTH_BASE_URL=http://localhost:8001

# Collector API URL
COLLECTOR_BASE_URL=http://localhost:8000
```

## Development Setup

1. Start the Auth Service:
```bash
cd auth/demo/server
deno run --allow-net --allow-env main.ts
```

2. Start the Collector:
```bash
cd collector
deno run --allow-net --allow-read --allow-write main.ts
```

3. Start the Dashboard Backend:
```bash
cd dashboard/backend
DASHBOARD_BACKEND_PORT=8010 AUTH_BASE_URL=http://localhost:8001 COLLECTOR_BASE_URL=http://localhost:8000 deno run --allow-net --allow-env main.ts
```

4. Start the Dashboard Frontend:
```bash
cd dashboard/frontend
npm install
npm run dev
```

## Production Configuration

For production, update the URLs to point to your deployed services:

```bash
VITE_DASHBOARD_BACKEND_URL=https://your-dashboard-backend.com
VITE_AUTH_SERVICE_URL=https://your-auth-service.com
VITE_COLLECTOR_URL=https://your-collector.com
```
