# Configuration Guide

All 4Insights services use **runtime environment variables** - the same pattern across backend and frontend.

## Environment Variables

### Auth Service
```bash
DEMO_HMAC_SECRET=your-secret-key
TOKEN_EXPIRY_MINUTES=25
CREDENTIAL_EXPIRY_HOURS=1
DEMO_AUTH_PORT=8001

# CORS allowed origins (comma-separated list)
AUTH_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8010
```

### Collector Service
```bash
COLLECTOR_PORT=8000
DATA_DIR=./data

# CORS allowed origins (comma-separated list)
COLLECTOR_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8010
```

### Dashboard Backend (BFF)
```bash
AUTH_BASE_URL=http://localhost:8001
COLLECTOR_BASE_URL=http://localhost:8000
DASHBOARD_BACKEND_PORT=8010

# CORS allowed origins (comma-separated list)
BACKEND_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Dashboard Frontend
```bash
DASHBOARD_BACKEND_URL=http://localhost:8010
AUTH_SERVICE_URL=http://localhost:8001
COLLECTOR_URL=http://localhost:8000
PORT=3000
ORIGIN=http://localhost:5173
```

## How It Works

### Backend Services (Deno)
- Read `process.env` or `Deno.env.get()` at **runtime**
- No rebuild needed when URLs change

### Frontend (SvelteKit)
- Fetches config from `/api/config` endpoint at **runtime**
- The endpoint reads `process.env` (Node.js server)
- No rebuild needed when URLs change

## Local Development

1. Copy `.env.example` to `.env` in each service directory
2. Edit values as needed
3. Start services

```bash
# Using make
make start-all

# Or manually
cd auth/demo/server && deno run --allow-net --allow-env main.ts
cd collector && deno run --allow-net --allow-read --allow-write main.ts
cd dashboard/backend && deno run --allow-net --allow-env main.ts
cd dashboard/frontend-new && npm run dev
```

## Docker Deployment

### Using docker-compose (local)

```bash
docker-compose up
```

Environment variables are set in `docker-compose.yml`.

### Using Docker directly

```bash
# Build
docker build -f docker/dashboard-frontend/Dockerfile -t frontend .

# Run with environment variables
docker run -p 3000:3000 \
  -e DASHBOARD_BACKEND_URL=https://your-backend.com \
  -e AUTH_SERVICE_URL=https://your-auth.com \
  -e COLLECTOR_URL=https://your-collector.com \
  frontend
```

## Production Deployment (Render, Fly.io, etc.)

### Method 1: Environment Variables (Recommended)

Set environment variables in your platform's UI:

**For all services:**
- Go to service settings
- Add environment variables
- Save (triggers redeploy if needed)

**No rebuild required** - just restart the service.

### Method 2: .env File

Upload `.env` file to your deployment:

```bash
# Example for Render "Secret Files"
# Filename: .env
# Contents:
DASHBOARD_BACKEND_URL=https://your-backend.onrender.com
AUTH_SERVICE_URL=https://your-auth.onrender.com
COLLECTOR_URL=https://your-collector.onrender.com
```

## Migration from Build-Time Config

If you were using `VITE_*` variables before:

**Old (build-time):**
```bash
VITE_DASHBOARD_BACKEND_URL=http://localhost:8010
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_COLLECTOR_URL=http://localhost:8000
```

**New (runtime):**
```bash
DASHBOARD_BACKEND_URL=http://localhost:8010
AUTH_SERVICE_URL=http://localhost:8001
COLLECTOR_URL=http://localhost:8000
```

Just rename the variables - no code changes needed!

## Troubleshooting

### Frontend shows "Failed to load runtime config"

**Problem:** The `/api/config` endpoint is not responding.

**Solution:**
1. Check that the frontend server is running
2. Verify environment variables are set
3. Check browser console for errors

### Backend services can't connect

**Problem:** Services return connection errors.

**Solution:**
1. Verify environment variables are correct
2. Check that target services are running
3. Use correct URLs (http://localhost for local, https:// for production)

### Changes to .env not taking effect

**Problem:** Updated .env but seeing old values.

**Solution:**
1. Restart the service
2. For frontend, hard refresh browser (Ctrl+Shift+R)
3. Check that .env file is in the correct directory

## Benefits of Runtime Configuration

- **Same pattern** across all services (backend and frontend)  
- **No rebuild** needed when URLs change  
- **Easy deployment** - just set environment variables  
- **Environment-specific** configs without multiple builds  
- **Secure** - secrets never baked into bundles  

## CORS Security

All services use **explicit allowed origins** - no wildcards (`*`) for security.

### How CORS Works

Each service validates the `Origin` header against a comma-separated list of allowed origins:

```typescript
// Example from collector/main.ts
const rawAllowed = Deno.env.get("COLLECTOR_ALLOWED_ORIGINS")
  ?? "http://localhost:5173,http://localhost:3000,http://localhost:8010";
const allowedOrigins = rawAllowed.split(",").map(s => s.trim()).filter(Boolean);

const isAllowed = origin !== null && allowedOrigins.includes(origin);

// Only set Access-Control-Allow-Origin when origin is explicitly allowed
if (isAllowed) {
  headers["Access-Control-Allow-Origin"] = origin;
  headers["Access-Control-Allow-Credentials"] = "true";
}
// For unauthorized origins, Access-Control-Allow-Origin is NOT set
// Browser will block the request, which is the desired security behavior
```

### Production CORS Configuration

For production, set explicit allowed origins as comma-separated values:

**Auth Service:**
```bash
AUTH_ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-backend.onrender.com
```

**Collector Service:**
```bash
COLLECTOR_ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-backend.onrender.com
```

**Dashboard Backend:**
```bash
BACKEND_ALLOWED_ORIGINS=https://your-frontend.onrender.com
```

**Important:**
- Never use `*` wildcards in production - this creates security vulnerabilities
- Only origins in the allowed list will receive `Access-Control-Allow-Origin` headers
- Unauthorized origins will be blocked by the browser (no CORS headers sent)

## Example: Deploying to Render

1. **Deploy Auth Service**
   - Set `DEMO_HMAC_SECRET`, `DEMO_AUTH_PORT`
   - Set `AUTH_ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-backend.onrender.com`
   - Note the URL: `https://your-auth.onrender.com`

2. **Deploy Collector Service**
   - Set `COLLECTOR_PORT`, `DATA_DIR`
   - Set `COLLECTOR_ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-backend.onrender.com`
   - Add persistent disk at `/data`
   - Note the URL: `https://your-collector.onrender.com`

3. **Deploy Dashboard Backend**
   - Set `AUTH_BASE_URL=https://your-auth.onrender.com`
   - Set `COLLECTOR_BASE_URL=https://your-collector.onrender.com`
   - Set `BACKEND_ALLOWED_ORIGINS=https://your-frontend.onrender.com`
   - Note the URL: `https://your-backend.onrender.com`

4. **Deploy Dashboard Frontend**
   - Set `DASHBOARD_BACKEND_URL=https://your-backend.onrender.com`
   - Set `AUTH_SERVICE_URL=https://your-auth.onrender.com`
   - Set `COLLECTOR_URL=https://your-collector.onrender.com`
   - Set `ORIGIN=https://your-frontend.onrender.com`
   - Done! No rebuild needed.

5. **Update URLs later?**
   - Just change the environment variables
   - Restart the service
   - No rebuild required!
