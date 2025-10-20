# Dashboard Backend — Environment

Copy `dashboard/backend/.env.example` to `dashboard/backend/.env` for local development.

Variables:
- DASHBOARD_BACKEND_PORT — Port for the backend (default: 8010)
- AUTH_BASE_URL — Base URL of the auth service, e.g. http://localhost:8001
- COLLECTOR_BASE_URL — Base URL of the collector service, e.g. http://localhost:8000

This service acts as a BFF (backend-for-frontend) and verifies tokens with the
auth service before fetching metrics from the collector.
