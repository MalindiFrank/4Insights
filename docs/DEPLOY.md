# Deploying 4Insights

This guide covers deploying 4Insights to production using Docker and cloud platforms (Render, Fly.io, Vercel, etc.).

## Overview

4Insights consists of four microservices:

1. **Tracker** - Client-side JavaScript snippet (bundled and served by frontend)
2. **Collector** - Deno service for event ingestion (port 8000)
3. **Auth** - Deno demo authentication service (port 8001)
4. **Dashboard Backend (BFF)** - Deno backend-for-frontend (port 8010)
5. **Dashboard Frontend** - SvelteKit application (port 3000 in production)

## Prerequisites

- Docker and docker-compose (for containerized deployment)
- Deno v2.x+ (for local development)
- Node.js >=18 (for frontend)
- Cloud platform account (Render, Fly.io, etc.)

## Configuration

**All services use runtime environment variables** - no rebuild needed when URLs change!

See [CONFIGURATION.md](./CONFIGURATION.md) for complete details.

### Required Environment Variables

#### Auth Service
```bash
DEMO_HMAC_SECRET=your-secret-key-change-in-production
TOKEN_EXPIRY_MINUTES=25
CREDENTIAL_EXPIRY_HOURS=1
DEMO_AUTH_PORT=8001
```

#### Collector Service
```bash
COLLECTOR_PORT=8000
DATA_DIR=./data
```

#### Dashboard Backend (BFF)
```bash
AUTH_BASE_URL=http://localhost:8001
COLLECTOR_BASE_URL=http://localhost:8000
DASHBOARD_BACKEND_PORT=8010
```

#### Dashboard Frontend
```bash
DASHBOARD_BACKEND_URL=http://localhost:8010
AUTH_SERVICE_URL=http://localhost:8001
COLLECTOR_URL=http://localhost:8000
PORT=3000
```

**Note**: Variable names changed from `VITE_*` to standard names. Frontend now loads config at runtime like backend services.

## Docker Deployment (Local/Testing)

### Using docker-compose (Recommended)

From the repository root:

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Service URLs (Docker)

- **Frontend**: http://localhost:5173
- **Dashboard Backend**: http://localhost:8010
- **Auth Service**: http://localhost:8001
- **Collector**: http://localhost:8000

### Environment Variables in Docker

Environment variables are set in `docker-compose.yml`. To override:

```bash
# Create .env file in repo root
echo "DEMO_HMAC_SECRET=my-secret" > .env

# docker-compose will automatically load it
docker-compose up
```

## Production Deployment

### Option 1: Render.com (Recommended)

Render supports Docker containers and makes deployment simple.

#### 1. Deploy Auth Service

1. Create new **Web Service** in Render
2. Connect your repository
3. Set **Dockerfile path**: `docker/auth/Dockerfile`
4. Set **Environment Variables**:
   ```
   DEMO_HMAC_SECRET=<generate-strong-secret>
   DEMO_AUTH_PORT=8001
   TOKEN_EXPIRY_MINUTES=25
   CREDENTIAL_EXPIRY_HOURS=1
   ```
5. Deploy and note the URL: `https://your-auth.onrender.com`

#### 2. Deploy Collector Service

1. Create new **Web Service** in Render
2. Set **Dockerfile path**: `docker/collector/Dockerfile`
3. Add **Persistent Disk** at `/data` (for event storage)
4. Set **Environment Variables**:
   ```
   COLLECTOR_PORT=8000
   DATA_DIR=/data
   ```
5. Deploy and note the URL: `https://your-collector.onrender.com`

#### 3. Deploy Dashboard Backend

1. Create new **Web Service** in Render
2. Set **Dockerfile path**: `docker/dashboard-backend/Dockerfile`
3. Set **Environment Variables**:
   ```
   AUTH_BASE_URL=https://your-auth.onrender.com
   COLLECTOR_BASE_URL=https://your-collector.onrender.com
   DASHBOARD_BACKEND_PORT=8010
   ```
4. Deploy and note the URL: `https://your-backend.onrender.com`

#### 4. Deploy Dashboard Frontend

1. Create new **Web Service** in Render
2. Set **Dockerfile path**: `docker/dashboard-frontend/Dockerfile`
3. Set **Environment Variables**:
   ```
   DASHBOARD_BACKEND_URL=https://your-backend.onrender.com
   AUTH_SERVICE_URL=https://your-auth.onrender.com
   COLLECTOR_URL=https://your-collector.onrender.com
   PORT=3000
   ```
4. Deploy and access at: `https://your-frontend.onrender.com`

**Important**: No rebuild needed when changing URLs! Just update environment variables and restart.

### Option 2: Fly.io

Similar to Render, but uses `fly.toml` configuration:

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy each service
cd docker/auth && fly launch
cd docker/collector && fly launch
cd docker/dashboard-backend && fly launch
cd docker/dashboard-frontend && fly launch
```

Set environment variables:
```bash
fly secrets set DEMO_HMAC_SECRET=your-secret
```

### Option 3: Vercel (Frontend Only)

Vercel can host the frontend, but backend services must be deployed elsewhere.

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy frontend:
   ```bash
   cd dashboard/frontend-new
   vercel
   ```
3. Set environment variables in Vercel dashboard:
   ```
   DASHBOARD_BACKEND_URL=https://your-backend.example.com
   AUTH_SERVICE_URL=https://your-auth.example.com
   COLLECTOR_URL=https://your-collector.example.com
   ```

**Note**: SvelteKit adapter is `@sveltejs/adapter-node`, so it runs as a Node.js server on Vercel.

## Post-Deployment

### Health Checks

Verify all services are running:

```bash
# Auth service
curl https://your-auth.onrender.com/health

# Collector
curl https://your-collector.onrender.com/health

# Dashboard backend
curl https://your-backend.onrender.com/health

# Frontend (should return HTML)
curl https://your-frontend.onrender.com
```

### Test the Flow

1. Open frontend: `https://your-frontend.onrender.com`
2. Click "Generate Credentials"
3. Copy API key and passphrase
4. Click "Login"
5. View metrics dashboard

### Updating Configuration

To change service URLs:

1. Go to service settings in Render/Fly.io
2. Update environment variables
3. Restart the service
4. **No rebuild required!**

## CI/CD

### GitHub Actions

The repository includes `.github/workflows/verify.yml` for CI:

- Runs on push to `main` and pull requests
- Checks Deno formatting and type checking
- Runs frontend type checking
- Executes Deno verification

### Automated Deployment

Connect your Render/Fly.io services to GitHub for automatic deployment on push:

1. In Render: Enable "Auto-Deploy" in service settings
2. In Fly.io: Use GitHub Actions with `fly deploy`

## Troubleshooting

### Service can't connect to other services

**Problem**: Backend returns connection errors.

**Solution**:
- Verify environment variables have correct URLs
- Use HTTPS URLs for production (not http://)
- Check that target services are running

### Frontend shows localhost URLs

**Problem**: Frontend trying to connect to `http://localhost:8001`

**Solution**:
- Verify environment variables are set in platform UI
- Restart the frontend service
- Check `/api/config` endpoint returns correct URLs

### Collector data not persisting

**Problem**: Events disappear after restart.

**Solution**:
- Add persistent disk/volume at `/data` path
- Verify `DATA_DIR=/data` environment variable is set

### CORS errors in browser

**Problem**: Browser console shows CORS errors.

**Solution**:
- Verify backend CORS configuration allows frontend origin
- Check that requests include `credentials: 'include'`
- Ensure backend URL is correct in frontend config
