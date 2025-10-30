### Tracker bundle stage (uses Deno to bundle tracker/index.ts)
FROM denoland/deno:2.5.4 AS tracker-builder
WORKDIR /app
COPY tracker/ ./tracker/
COPY deno.json deno.lock ./
# Cache dependencies first using the root deno.json config
RUN deno cache --config /app/deno.json --lock /app/deno.lock /app/tracker/build.ts
# Use build.ts script which is more reliable than deno bundle in Docker
# Need --allow-run to spawn deno bundle subprocess
RUN deno run --allow-read --allow-write --allow-net --allow-env --allow-run --config /app/deno.json --lock /app/deno.lock tracker/build.ts --outDir=tracker/build

### Build stage (Node) - builds the NEW frontend site
FROM node:20-alpine AS builder
WORKDIR /app

# Note: Configuration is now loaded at runtime via /api/config endpoint
# No build-time environment variables needed - works like backend services!

# Copy package files from the NEW frontend
COPY dashboard/frontend-new/package.json dashboard/frontend-new/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application source from the NEW frontend
COPY dashboard/frontend-new/ ./

# Build the SvelteKit app (creates /app/build directory)
RUN npm run build

# Copy the tracker bundle produced by the Deno stage into the built site
RUN mkdir -p /app/build/client/static || true
COPY --from=tracker-builder /app/tracker/build/tracker.js /app/build/client/static/tracker.js

### Production stage (Node.js)
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sveltekit -u 1001

# Copy package files for production dependencies
COPY dashboard/frontend-new/package.json dashboard/frontend-new/package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./

# Switch to non-root user
USER sveltekit

# Expose the port SvelteKit runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "build"]
