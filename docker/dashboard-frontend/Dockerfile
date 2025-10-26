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

### Build stage (Node) - builds the frontend site
FROM node:20-alpine3.18 AS builder
WORKDIR /app
COPY dashboard/frontend/package.json dashboard/frontend/package-lock.json* ./
COPY dashboard/frontend/ ./
RUN npm ci --silent && npm run build

# Copy the tracker bundle produced by the Deno stage into the built site
RUN mkdir -p /app/build/static || true
COPY --from=tracker-builder /app/tracker/build/tracker.js /app/build/static/tracker.js

### Production stage (Node.js)
FROM node:20-alpine3.18
WORKDIR /app
# Copy built frontend files from builder stage
COPY --from=builder /app/build ./build
# Copy package.json for dependencies
COPY dashboard/frontend/package.json ./
# Install only production dependencies
RUN npm ci --omit=dev --silent

EXPOSE 5173
# Use SvelteKit's built-in preview server
CMD ["node", "-e", "import('./build/index.js').then(m => m.default({ port: 5173 }))"]
