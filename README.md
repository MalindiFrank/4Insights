# 4Insights

A lightweight, privacy-first web analytics platform designed to be simple to operate, easy to extend, and production-ready.

[![CI](https://github.com/MalindiFrank/4insights/workflows/Verify/badge.svg)](https://github.com/MalindiFrank/4insights/actions)

---

## What is 4Insights?

4Insights helps website owners understand how people use their sites — which pages are popular, how visitors move between pages, and what content works best — **without spying on anyone**.

It's designed so you can get started quickly: add a tiny snippet of code to your site, and the system collects anonymous, summary information that helps you improve your site.

### Key Features

 - **Privacy-First** - No personal identifiers, no tracking cookies, no user profiling  
 - **Lightweight** - Minimal JavaScript tracker (~2KB gzipped)  
 - **Self-Hosted** - Full control over your data  
 - **Real-Time** - See metrics as they happen  
 - **Simple** - Easy to deploy and operate  
 - **Extensible** - Modular architecture with pluggable storage and auth  

---

## Architecture

4Insights consists of four microservices:

```
┌─────────────┐
│   Browser   │
│  (Tracker)  │
└──────┬──────┘
       │ pageview events
       ↓
┌─────────────┐     ┌──────────────┐
│  Collector  │────→│ NDJSON Files │
│  (Deno)     │     │  (Storage)   │
└─────────────┘     └──────────────┘
       ↑
       │ metrics query
       │
┌─────────────┐     ┌──────────────┐
│  Dashboard  │────→│     Auth     │
│   Backend   │     │   Service    │
│   (BFF)     │     │   (Demo)     │
└──────┬──────┘     └──────────────┘
       │
       ↓
┌─────────────┐
│  Dashboard  │
│  Frontend   │
│ (SvelteKit) │
└─────────────┘
```

### Components

- **Tracker** - Client-side JavaScript snippet that captures pageviews
- **Collector** - Deno service that ingests, validates, and stores events
- **Auth** - Demo authentication service for API credentials and sessions
- **Dashboard Backend (BFF)** - Backend-for-frontend that validates tokens and aggregates metrics
- **Dashboard Frontend** - SvelteKit application for viewing analytics

---

## Quick Start

### Prerequisites

- **Deno** v2.x+ (for backend services)
- **Node.js** >=18 (for frontend)
- **Docker** (optional, for containerized deployment)

### 1. Clone the repository

```bash
git clone https://github.com/MalindiFrank/4insights.git
cd 4insights
```

### 2. Set up environment variables

```bash
# Copy example env files
cp auth/demo/server/.env.example auth/demo/server/.env
cp collector/.env.example collector/.env
cp dashboard/backend/.env.example dashboard/backend/.env
cp dashboard/frontend-new/.env.example dashboard/frontend-new/.env
```

### 3. Start all services

```bash
# Using Make (recommended)
make start-all

# Or using Docker
docker-compose up
```

### 4. Access the dashboard

Open http://localhost:5173 in your browser.

1. Click **"Generate Credentials"** to create an API key
2. Copy the API key and passphrase
3. Click **"Login"** and enter your credentials
4. View your analytics dashboard

---

## Documentation

- **[Development Guide](docs/DEVELOPMENT.md)** - Local development setup and workflows
- **[Deployment Guide](docs/DEPLOY.md)** - Production deployment instructions
- **[Configuration Guide](docs/CONFIGURATION.md)** - Environment variables and runtime config

### Service Documentation

- [Tracker](tracker/README.md) - Client-side tracking snippet
- [Collector](collector/README.md) - Event ingestion service
- [Auth Service](auth/demo/README.md) - Demo authentication
- [Dashboard Backend](dashboard/backend/README.md) - BFF service
- [Dashboard Frontend](dashboard/frontend-new/README.md) - SvelteKit UI

---

## Development

### Start services locally

```bash
# All services
make start-all

# Or in tmux (separate panes)
make dev-tmux
```

### Run tests

```bash
# All checks and tests
make verify

# Frontend type checking
cd dashboard/frontend-new && npm run check

# E2E tests
cd dashboard/frontend-new && npm run test:e2e
```

### Format and lint

```bash
# Deno services
deno fmt
deno lint

# Frontend
cd dashboard/frontend-new && npm run check
```

---

## Deployment

### Docker (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Cloud Platforms

4Insights can be deployed to:

- **Render.com** - Recommended for Docker containers
- **Fly.io** - Great for global edge deployment
- **Vercel** - Frontend only (backend services elsewhere)

See [Deployment Guide](docs/DEPLOY.md) for detailed instructions.

---

## Configuration

All services use **runtime environment variables** - no rebuild needed when URLs change!

```bash
# Backend services (Deno)
AUTH_BASE_URL=http://localhost:8001
COLLECTOR_BASE_URL=http://localhost:8000

# Frontend (SvelteKit)
DASHBOARD_BACKEND_URL=http://localhost:8010
AUTH_SERVICE_URL=http://localhost:8001
COLLECTOR_URL=http://localhost:8000

# CORS Security (explicit allowed origins - no wildcards)
AUTH_ALLOWED_ORIGIN_1=http://localhost:5173
BACKEND_ALLOWED_ORIGIN_1=http://localhost:5173
COLLECTOR_ALLOWED_ORIGIN_1=http://localhost:5173
```

See [Configuration Guide](docs/CONFIGURATION.md) for complete details.

---

## Privacy & Security

4Insights is privacy-first by design:

- **No personal identifiers** - No cookies, no fingerprinting, no user tracking
- **Anonymous data only** - Aggregated pageviews and paths
- **HTTPS required** - Transport security for production
- **Explicit CORS origins** - No wildcards (`*`), only allowed origins accepted
- **Credential support** - Secure cross-origin requests with `Access-Control-Allow-Credentials`
-  - **API key scoping** - Site-level access control
-  - **Rate limiting** - Protection against abuse
-  - **Self-hosted** - You control your data

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Keep changes small** - One logical change per PR
2. **Add tests** - Cover new functionality
3. **Follow style** - Use `deno fmt` and `npm run check`
4. **Update docs** - Keep documentation in sync

See [Development Guide](docs/DEVELOPMENT.md) for setup instructions.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/MalindiFrank/4insights/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MalindiFrank/4insights/discussions)
- **Documentation**: [docs/](docs/)

---

**Built with using Deno, SvelteKit, and TypeScript**

