# Render Quick Start Guide

## TL;DR - Fix Frontend Using localhost URLs

Your frontend is using `http://localhost:8001` in production because the `VITE_*` environment variables weren't set during the Docker build.

### Solution: Set Environment Variables in Render UI

1. Go to your **Dashboard Frontend** service in Render
2. Click **Environment** tab
3. Add these variables:

```
VITE_DASHBOARD_BACKEND_URL=https://your-dashboard-backend.onrender.com
VITE_AUTH_SERVICE_URL=https://your-auth-service.onrender.com
VITE_COLLECTOR_URL=https://your-collector-service.onrender.com
```

4. Click **Save Changes** (triggers automatic redeploy)
5. Wait for build to complete
6. Check build logs - you should see:
   ```
   Building with:
     VITE_DASHBOARD_BACKEND_URL=https://your-dashboard-backend.onrender.com
     VITE_AUTH_SERVICE_URL=https://your-auth-service.onrender.com
     VITE_COLLECTOR_URL=https://your-collector-service.onrender.com
   ```

7. Test in browser - no more localhost URLs!

---

## All Services Environment Variables

### Auth Service
```
DEMO_HMAC_SECRET=<run: openssl rand -base64 32>
TOKEN_EXPIRY_MINUTES=25
CREDENTIAL_EXPIRY_HOURS=1
DEMO_AUTH_PORT=8001
```

### Collector Service
```
COLLECTOR_PORT=8000
DATA_DIR=/data
```
+ Add Persistent Disk at `/data`

### Dashboard Backend
```
AUTH_BASE_URL=https://your-auth-service.onrender.com
COLLECTOR_BASE_URL=https://your-collector-service.onrender.com
DASHBOARD_BACKEND_PORT=8010
```

### Dashboard Frontend
```
VITE_DASHBOARD_BACKEND_URL=https://your-dashboard-backend.onrender.com
VITE_AUTH_SERVICE_URL=https://your-auth-service.onrender.com
VITE_COLLECTOR_URL=https://your-collector-service.onrender.com
PORT=3000
NODE_ENV=production
```

---

## Why This Matters

- **Backend services** (Deno): Read env vars at **runtime** ✅
- **Frontend** (Vite): Needs env vars at **build time** ⚠️

The frontend is a client-side app. Vite bakes the URLs into the JavaScript bundle during `npm run build`. If the env vars aren't set during build, it uses the defaults (`localhost`).

---

## Detailed Guide

See `render-configs/README.md` for complete instructions.
