# Render Configuration Files

This directory contains environment configuration templates for deploying 4Insights to Render.com.

## Deployment Methods

### Method 1: Environment Variables (Recommended)

Set environment variables directly in Render's UI for each service.

**Advantages:**
- Easy to update without redeploying
- Visible in Render dashboard
- Works for both build-time and runtime variables

**Steps:**
1. Go to your service in Render dashboard
2. Navigate to "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable from the corresponding `.env` file below
5. Save changes (will trigger automatic redeploy)

---

### Method 2: Secret Files

Upload `.env` files as Secret Files in Render.

**Advantages:**
- Keep all variables in one file
- Easy to copy/paste from local development

**Limitations:**
- ⚠️ **Does NOT work for frontend build-time variables** (VITE_*)
- Only works for runtime environment variables

**Steps:**
1. Go to your service in Render dashboard
2. Navigate to "Environment" tab
3. Scroll to "Secret Files" section
4. Click "Add Secret File"
5. Set filename: `.env`
6. Paste contents from the corresponding file below
7. Save changes (will trigger automatic redeploy)

---

## Service Configurations

### 1. Auth Service

**File:** `auth-service.env`

**Environment Variables:**
```
DEMO_HMAC_SECRET=<generate-secure-random-string>
TOKEN_EXPIRY_MINUTES=25
CREDENTIAL_EXPIRY_HOURS=1
DEMO_AUTH_PORT=8001
```

**Generate secure secret:**
```bash
openssl rand -base64 32
```

---

### 2. Collector Service

**File:** `collector-service.env`

**Environment Variables:**
```
COLLECTOR_PORT=8000
DATA_DIR=/data
```

**Additional Setup:**
- Add a Persistent Disk mounted at `/data`

---

### 3. Dashboard Backend (BFF)

**File:** `dashboard-backend.env`

**Environment Variables:**
```
AUTH_BASE_URL=https://your-auth-service.onrender.com
COLLECTOR_BASE_URL=https://your-collector-service.onrender.com
DASHBOARD_BACKEND_PORT=8010
```

**Important:** Replace the URLs with your actual Render service URLs from steps 1 and 2.

---

### 4. Dashboard Frontend

**File:** `dashboard-frontend.env`

**⚠️ CRITICAL: Frontend Build-Time Variables**

The frontend requires `VITE_*` variables at **BUILD TIME**. These MUST be set as **Environment Variables** in Render's UI, NOT as Secret Files.

**Environment Variables (Set in Render UI):**
```
VITE_DASHBOARD_BACKEND_URL=https://your-dashboard-backend.onrender.com
VITE_AUTH_SERVICE_URL=https://your-auth-service.onrender.com
VITE_COLLECTOR_URL=https://your-collector-service.onrender.com
PORT=3000
NODE_ENV=production
```

**Why?**
- Vite (the build tool) needs these variables during the Docker build process
- Render automatically passes Environment Variables as Docker build args
- Secret Files are only available at runtime, not during build

**Verification:**
After deploying, check the build logs. You should see:
```
Building with:
  VITE_DASHBOARD_BACKEND_URL=https://your-dashboard-backend.onrender.com
  VITE_AUTH_SERVICE_URL=https://your-auth-service.onrender.com
  VITE_COLLECTOR_URL=https://your-collector-service.onrender.com
```

If you see `localhost` URLs, the environment variables were not set correctly.

---

## Deployment Order

Deploy services in this order to get the URLs needed for dependent services:

1. **Auth Service** → Get URL
2. **Collector Service** → Get URL
3. **Dashboard Backend** → Use URLs from steps 1-2, get URL
4. **Dashboard Frontend** → Use URL from step 3

---

## Updating Environment Variables

### For Backend Services (Deno)
- Update environment variables in Render UI
- Changes take effect on next deploy
- Or trigger manual redeploy

### For Frontend (Vite/SvelteKit)
- Update `VITE_*` environment variables in Render UI
- **Must trigger a manual redeploy** (rebuild)
- The new URLs will be baked into the JavaScript bundle

---

## Troubleshooting

### Frontend still uses localhost URLs

**Problem:** Browser network tab shows requests to `http://localhost:8001`

**Solution:**
1. Verify `VITE_*` variables are set in Render UI (not Secret Files)
2. Trigger a manual redeploy
3. Check build logs for the URLs being used
4. Clear browser cache and hard refresh

### Backend can't connect to other services

**Problem:** Backend logs show connection errors

**Solution:**
1. Verify `AUTH_BASE_URL` and `COLLECTOR_BASE_URL` are correct
2. Use full HTTPS URLs (e.g., `https://service.onrender.com`)
3. Ensure the target services are deployed and healthy

### CORS errors in browser

**Problem:** Browser console shows CORS errors

**Solution:**
1. Verify frontend is using correct backend URL
2. Check backend CORS configuration allows frontend origin
3. Ensure all URLs use HTTPS in production

---

## Security Best Practices

1. **Never commit actual secrets** to git
2. **Generate unique HMAC secret** for production
3. **Use HTTPS** for all service URLs
4. **Restrict CORS** to your frontend domain in production
5. **Rotate secrets** periodically

---

## Example: Complete Frontend Setup

1. Go to frontend service in Render
2. Click "Environment" tab
3. Add these variables:

| Key | Value |
|-----|-------|
| `VITE_DASHBOARD_BACKEND_URL` | `https://fourinsights-backend.onrender.com` |
| `VITE_AUTH_SERVICE_URL` | `https://fourinsights-auth.onrender.com` |
| `VITE_COLLECTOR_URL` | `https://fourinsights-collector.onrender.com` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

4. Click "Save Changes"
5. Wait for automatic redeploy
6. Check build logs for confirmation
7. Test in browser

---

## Support

If you encounter issues:
1. Check Render build logs
2. Verify all environment variables are set
3. Ensure services are deployed in correct order
4. Test each service's `/health` endpoint

