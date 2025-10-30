# 4Insights Documentation

Welcome to the 4Insights documentation! This directory contains comprehensive guides for developing, deploying, and configuring the 4Insights analytics platform.

---

## 📚 Main Documentation

### [Development Guide](./DEVELOPMENT.md)
Complete guide for local development, testing, and CI/CD workflows.

**Topics covered:**
- Quick start for local development
- Running services individually or with Make/tmux
- Testing (Playwright E2E, Deno unit tests)
- CI/CD with GitHub Actions
- Troubleshooting common issues

**Start here if you're:** Setting up the project locally, contributing code, or running tests.

---

### [Deployment Guide](./DEPLOY.md)
Production deployment instructions for Docker and cloud platforms.

**Topics covered:**
- Docker deployment (local and production)
- Deploying to Render.com (recommended)
- Deploying to Fly.io
- Deploying to Vercel (frontend only)
- Health checks and post-deployment verification
- Troubleshooting deployment issues

**Start here if you're:** Deploying to production, setting up staging environments, or using Docker.

---

### [Configuration Guide](./CONFIGURATION.md)
Environment variables and runtime configuration for all services.

**Topics covered:**
- Environment variables for each service
- How runtime configuration works
- Local development setup
- Docker configuration
- Production deployment configuration
- Migration from build-time to runtime config

**Start here if you're:** Setting up environment variables, configuring services, or troubleshooting config issues.

---

## 🔧 Service-Specific Documentation

### Backend Services (Deno)

- **[Auth Service](../auth/demo/README.md)** - Demo authentication service
- **[Collector](../collector/README.md)** - Event ingestion and storage
- **[Dashboard Backend](../dashboard/backend/README.md)** - Backend-for-frontend (BFF)

### Frontend (Node/SvelteKit)

- **[Dashboard Frontend](../dashboard/frontend-new/README.md)** - SvelteKit UI

### Tracker (Client-Side)

- **[Tracker](../tracker/README.md)** - JavaScript tracking snippet

---

## 🚀 Quick Links

### Getting Started

1. **First time setup**: [Development Guide - Quick Start](./DEVELOPMENT.md#quick-start-local)
2. **Environment setup**: [Configuration Guide - Local Development](./CONFIGURATION.md#local-development)
3. **Running tests**: [Development Guide - Testing](./DEVELOPMENT.md#testing)

### Deployment

1. **Docker deployment**: [Deployment Guide - Docker](./DEPLOY.md#docker-deployment-localtesting)
2. **Render deployment**: [Deployment Guide - Render](./DEPLOY.md#option-1-rendercom-recommended)
3. **Environment variables**: [Configuration Guide - Production](./CONFIGURATION.md#production-deployment-render-flyio-etc)

### Troubleshooting

1. **Development issues**: [Development Guide - Troubleshooting](./DEVELOPMENT.md#troubleshooting)
2. **Deployment issues**: [Deployment Guide - Troubleshooting](./DEPLOY.md#troubleshooting)
3. **Configuration issues**: [Configuration Guide - Troubleshooting](./CONFIGURATION.md#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Browser   │
│  (Tracker)  │  ← Client-side JavaScript snippet
└──────┬──────┘
       │ POST /4insights/collect
       ↓
┌─────────────┐     ┌──────────────┐
│  Collector  │────→│ NDJSON Files │  ← Event storage
│  (Deno)     │     │  (./data)    │
│  Port 8000  │     └──────────────┘
└─────────────┘
       ↑
       │ GET /metrics
       │
┌─────────────┐     ┌──────────────┐
│  Dashboard  │────→│     Auth     │  ← Token validation
│   Backend   │     │   Service    │
│   (BFF)     │     │  (Demo)      │
│  Port 8010  │     │  Port 8001   │
└──────┬──────┘     └──────────────┘
       │
       │ GET /dashboard/metrics
       ↓
┌─────────────┐
│  Dashboard  │  ← SvelteKit UI
│  Frontend   │
│ (SvelteKit) │
│  Port 5173  │
└─────────────┘
```

### Key Concepts

- **Runtime Configuration**: All services load config at runtime (no rebuild needed)
- **API Key Scoping**: Each site has its own API key for data isolation
- **Token-Based Auth**: Short-lived bearer tokens for dashboard access
- **CORS Support**: Configured for cross-origin requests
- **Privacy-First**: No personal identifiers, anonymous aggregation only

---

**Last updated**: See git history for latest changes
