### Tracker bundle stage (uses Deno to bundle tracker/index.ts)
FROM denoland/deno:2.5.4 AS tracker-builder
WORKDIR /tracker
COPY tracker/ ./
RUN deno cache --config tsconfig.json index.ts && deno bundle --config tsconfig.json index.ts build/tracker.js

### Build stage (Node) - builds the frontend site
FROM node:20-alpine3.18 AS builder
WORKDIR /app
COPY dashboard/frontend/package.json dashboard/frontend/package-lock.json* ./
COPY dashboard/frontend/ ./
RUN npm ci --silent && npm run build

# Copy the tracker bundle produced by the Deno stage into the built site
RUN mkdir -p /app/build/static || true
COPY --from=tracker-builder /tracker/build/tracker.js /app/build/static/tracker.js

### Production stage (nginx)
FROM nginx:1.25.3-alpine3.18-slim
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
