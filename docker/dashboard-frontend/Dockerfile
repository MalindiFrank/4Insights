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
RUN mkdir -p /app/.svelte-kit/output/client/static || true
COPY --from=tracker-builder /app/tracker/build/tracker.js /app/.svelte-kit/output/client/static/tracker.js

### Production stage (Node.js)
FROM node:20-alpine3.18
WORKDIR /app
# Copy package.json and lock file
COPY dashboard/frontend/package.json dashboard/frontend/package-lock.json ./
# Install all dependencies (adapter-node needs all dependencies to run)
RUN npm ci --silent
# Copy the built SvelteKit app with adapter-node
# adapter-node outputs to .svelte-kit/output with server/ and client/ subdirectories
COPY --from=builder /app/.svelte-kit/output/server ./build
COPY --from=builder /app/.svelte-kit/output/client ./build/client

EXPOSE 3000
# Run SvelteKit server using adapter-node
# The build directory contains the server entry point
# adapter-node uses port 3000 by default (can be overridden with PORT env var)
ENV PORT=3000
CMD ["node", "build/index.js"]
