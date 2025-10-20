## Makefile for 4Insights — quick start and dev tasks

.PHONY: all auth collector backend frontend start-all fmt check svelte-check

all: start-all

## Start services in order: auth -> collector -> backend -> frontend (frontend runs in foreground)
start-all: auth collector backend frontend

## Run auth service (demo)
auth:
	@echo "Starting Auth (auth/demo/server)..."
	cd auth/demo/server && deno run --allow-net --allow-env main.ts &

## Run collector
collector:
	@echo "Starting Collector (collector)..."
	cd collector && deno run --allow-net --allow-read --allow-write main.ts &

## Run dashboard backend
backend:
	@echo "Starting Dashboard Backend (dashboard/backend)..."
	cd dashboard/backend && deno run --allow-net --allow-env main.ts &

## Run dashboard frontend (SvelteKit dev server)
frontend:
	@echo "Starting Dashboard Frontend (dashboard/frontend)..."
	cd dashboard/frontend && npm install --no-audit --no-fund && npm run dev

## Format Deno code
fmt:
	@echo "Running deno fmt..."
	deno fmt

## Run Deno type checks (quick)
check:
	@echo "Running deno check on Deno services..."
	deno check --unstable auth/demo/server || true
	deno check --unstable collector || true
	deno check --unstable dashboard/backend || true

## Run Svelte checks for frontend
svelte-check:
	@echo "Running svelte-check for dashboard/frontend..."
	cd dashboard/frontend && npm run check
