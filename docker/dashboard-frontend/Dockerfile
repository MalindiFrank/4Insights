### Tracker bundle stage (uses Deno to bundle tracker/index.ts)
FROM denoland/deno:2.5.4 AS tracker-builder
WORKDIR /app
COPY tracker/ ./tracker/
COPY deno.json deno.lock ./
# Use build.ts script which is more reliable than deno bundle in Docker
# Need --allow-net to fetch JSR dependencies during build
RUN deno run --allow-read --allow-write --allow-net tracker/build.ts --outDir=tracker/build

### Build stage (Node) - builds the frontend site
FROM node:20-alpine3.18 AS builder
WORKDIR /app
COPY dashboard/frontend/package.json dashboard/frontend/package-lock.json* ./
COPY dashboard/frontend/ ./
RUN npm ci --silent && npm run build

# Copy the tracker bundle produced by the Deno stage into the built site
RUN mkdir -p /app/build/static || true
COPY --from=tracker-builder /app/tracker/build/tracker.js /app/build/static/tracker.js

### Production stage (nginx)
FROM nginx:1.25.3-alpine3.18-slim
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
