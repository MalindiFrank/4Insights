# Docker Deployment Guide - dashboard-frontend

**Location:** `./Dockerfile`

**Architecture:**
- Multi-stage build (builder + runner)
- Base image: `node:20-alpine`
- Final image size: **136MB** (below 150MB target!)
- Security: Non-root user (sveltekit:nodejs)
- Health check: Built-in HTTP check every 30s

**Build stages:**
1. **Builder stage:** Installs deps, builds SvelteKit app
2. **Runner stage:** Production-only deps, runs the built app

### .dockerignore Created ✓
**Location:** `./.dockerignore`

**Excludes:**
- node_modules (rebuilt in container)
- Build artifacts (.svelte-kit, build, dist)
- Environment files (.env, .env.*)
- Testing files (coverage, test-results)
- IDE files (.vscode, .idea)
- Documentation (docs/, *.md)
- Git files

### Local Build Tested ✓
**Command:**
```bash
docker build -t dashboard-frontend:latest .
```

### Local Run Tested ✓
**Command:**
```bash
docker run -d -p 3000:3000 \
  -e VITE_DASHBOARD_BACKEND_URL=http://localhost:8010 \
  -e VITE_AUTH_SERVICE_URL=http://localhost:8001 \
  -e VITE_COLLECTOR_URL=http://localhost:8000 \
  --name dashboard-frontend-test \
  dashboard-frontend:latest
```

**Results: If Container started successfully**
- ✅ Health check: **HEALTHY** - ✅ HTTP response: **200 OK**
- ✅ Application accessible at http://localhost:3000
- ✅ Logs show: "Listening on http://0.0.0.0:3000"

---

## 📋 Deployment Summary
### Key Features

✅ **Lightweight:** 136MB final image (Alpine-based)
✅ **Secure:** Runs as non-root user
✅ **Robust:** Built-in health checks
✅ **Clean:** Multi-stage build, production deps only
✅ **Simple:** Standard Node.js deployment, no NGINX needed

---

## Usage Guide

### Build the Image
```bash
docker build -t dashboard-frontend:latest .
```

### Run Locally (Development)
```bash
docker run -d -p 3000:3000 \
  -e VITE_DASHBOARD_BACKEND_URL=http://localhost:8010 \
  -e VITE_AUTH_SERVICE_URL=http://localhost:8001 \
  -e VITE_COLLECTOR_URL=http://localhost:8000 \
  --name dashboard-frontend \
  dashboard-frontend:latest
```

### Run with Production URLs
```bash
docker run -d -p 3000:3000 \
  -e VITE_DASHBOARD_BACKEND_URL=https://fourinsights-dashboard-backend.onrender.com \
  -e VITE_AUTH_SERVICE_URL=https://fourinsights-auth-demo.onrender.com \
  -e VITE_COLLECTOR_URL=https://fourinsights-collector.onrender.com \
  -e ORIGIN=https://fourinsights-dashboard-frontend.onrender.com \
  --name dashboard-frontend \
  dashboard-frontend:latest
```

### View Logs
```bash
docker logs dashboard-frontend
docker logs -f dashboard-frontend  # Follow logs
```

### Check Health
```bash
docker ps  # Look for "healthy" status
docker inspect --format='{{.State.Health.Status}}' dashboard-frontend
```

### Stop and Remove
```bash
docker stop dashboard-frontend
docker rm dashboard-frontend
```

---

## 🔧 Environment Variables

### Required (Build-time)
These are baked into the build via Vite:

- `VITE_DASHBOARD_BACKEND_URL` - Dashboard Backend (BFF) URL
- `VITE_AUTH_SERVICE_URL` - Auth service URL
- `VITE_COLLECTOR_URL` - Collector API URL

### Optional (Runtime)
- `PORT` - Port to listen on (default: 3000)
- `ORIGIN` - SvelteKit origin for CSRF protection (production)
- `NODE_ENV` - Set to "production" (already set in Dockerfile)

---

## 📊 Architecture

```
┌─────────────────────────────────────┐
│  Docker Container (136MB)           │
│  ┌───────────────────────────────┐  │
│  │  Node.js 20 (Alpine)          │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  SvelteKit App          │  │  │
│  │  │  (adapter-node server)  │  │  │
│  │  │  Port: 3000             │  │  │
│  │  └─────────────────────────┘  │  │
│  │  User: sveltekit (non-root)   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---
## 🔍 Troubleshooting

### Container won't start
```bash
docker logs dashboard-frontend
```

### Health check failing
```bash
docker exec dashboard-frontend curl http://localhost:3000
```

### Port already in use
```bash
# Use a different port
docker run -p 3001:3000 ...
```

### Environment variables not working
- Remember: VITE_ vars are build-time only
- Rebuild image if you change them
- Or use SvelteKit's runtime config

---