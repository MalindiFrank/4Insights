### Tracker bundle stage (uses Deno to bundle tracker/index.ts)
FROM denoland/deno:alpine-1.34.3 AS tracker-builder
WORKDIR /tracker
COPY tracker/ ./
RUN deno cache index.ts && deno bundle index.ts build/tracker.js

### Build stage (Node) - builds the frontend site
FROM node:20-alpine AS builder
WORKDIR /app
COPY dashboard/frontend/package.json dashboard/frontend/package-lock.json* ./
COPY dashboard/frontend/ ./
RUN npm ci --silent && npm run build

# Copy the tracker bundle produced by the Deno stage into the built site
RUN mkdir -p /app/build/static || true
COPY --from=tracker-builder /tracker/build/tracker.js /app/build/static/tracker.js

### Production stage (nginx)
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
