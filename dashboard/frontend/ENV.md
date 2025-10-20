# Dashboard Frontend — Environment

Create `dashboard/frontend/.env` from `.env.example`. The dashboard uses Vite's
`import.meta.env.VITE_*` variables and they must be prefixed with `VITE_`.

Important variables:
- VITE_DASHBOARD_BACKEND_URL — URL of the dashboard backend BFF (default `http://localhost:8010`)
- VITE_AUTH_SERVICE_URL — Auth service URL (default `http://localhost:8001`)
- VITE_COLLECTOR_URL — Collector URL (used when accessing collector directly)

Running locally:

```bash
cd dashboard/frontend
npm install
npm run dev
```
