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

## Start all services inside a tmux session named '4insights'
.PHONY: dev-tmux stop-dev-tmux
dev-tmux:
	@echo "Starting dev session in tmux (session name: 4insights)"
	@if ! command -v tmux >/dev/null 2>&1; then \
		echo "tmux not found. Install tmux or run 'make start-all' instead."; exit 1; \
	fi
	@tmux new-session -d -s 4insights -n auth 'cd auth/demo/server && deno run --allow-net --allow-env main.ts'
	@tmux split-window -h -t 4insights 'cd collector && deno run --allow-net --allow-read --allow-write main.ts'
	@tmux split-window -v -t 4insights 'cd dashboard/backend && deno run --allow-net --allow-env main.ts'
	@tmux select-pane -t 0
	@tmux split-window -v -t 4insights 'cd dashboard/frontend && npm install --no-audit --no-fund && npm run dev'
	@tmux attach -t 4insights

stop-dev-tmux:
	-@tmux kill-session -t 4insights || true
