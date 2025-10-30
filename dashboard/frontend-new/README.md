# 4Insights Dashboard

A SvelteKit-based dashboard for the 4Insights analytics platform. This dashboard provides a clean, modern interface for viewing analytics data collected by the 4Insights tracker.

## Features

- **Real-time Metrics**: Displays total events, pageviews, and top paths
- **Clean Interface**: Minimal, modern design without external styling libraries
- **Responsive Layout**: Works on desktop and mobile devices
- **Auto-refresh**: Manual refresh capability for updated metrics
- **Dark Mode Support**: Automatic dark mode detection and styling

## Architecture

The dashboard is built with:
- **SvelteKit**: Modern web framework for the frontend
- **TypeScript**: Type-safe development
- **Native CSS**: No external styling dependencies
- **Fetch API**: Communicates with the Dashboard Backend (BFF)

## Quick Start

### Prerequisites

- Node.js (for npm)
- 4Insights Dashboard Backend running on `http://localhost:8010`

### Installation

1. Copy example env and edit if needed:

```bash
cp dashboard/frontend-new/.env.example dashboard/frontend-new/.env
```

2. Install dependencies and start dev server:

```bash
cd dashboard/frontend-new
npm install
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Configuration

The frontend uses **runtime configuration** (like backend services) - no rebuild needed when URLs change!

### Environment Variables

Create `.env` from `.env.example`:

```bash
cp dashboard/frontend-new/.env.example dashboard/frontend-new/.env
```

Important variables:

- `DASHBOARD_BACKEND_URL` - URL of the dashboard backend BFF (default: `http://localhost:8010`)
- `AUTH_SERVICE_URL` - URL of the auth service (default: `http://localhost:8001`)
- `COLLECTOR_URL` - URL of the collector service (default: `http://localhost:8000`)

### How It Works

The frontend loads configuration at **runtime** via the `/api/config` endpoint:

1. On page load, the app fetches `/api/config`
2. The endpoint reads `process.env` (Node.js server)
3. Configuration is cached in the browser
4. No rebuild needed when URLs change!

This is the same pattern used by backend services (Deno).

See [../../docs/CONFIGURATION.md](../../docs/CONFIGURATION.md) for complete details.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run type checking
- `npm run check:watch` - Run type checking in watch mode

### E2E & tests

- `npm run start:services` - convenience script that runs the root `make start-all` to start the Deno services and frontend (calls Makefile). This does not add any new packages; it is a thin wrapper to the existing Makefile.
- Playwright-based browser tests are intentionally run separately (Node runtime). To run Playwright tests:

```bash
cd dashboard/frontend-new
npm install --save-dev @playwright/test
npx playwright install
npm run test:e2e
```

## Integration

The dashboard automatically fetches metrics from the Backend API and displays:

- **Total Events**: Count of all tracked events
- **Total Pageviews**: Count of pageview events specifically
- **Top Paths**: Most visited pages with view counts

## Styling

The dashboard uses a minimal, modern design with:

- Native CSS (no external libraries)


