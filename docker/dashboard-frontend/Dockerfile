### Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY dashboard/frontend/package.json dashboard/frontend/package-lock.json* ./
COPY dashboard/frontend/ ./
RUN npm ci --silent && npm run build

### Production stage
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html

# If tracker build exists, also copy it to a predictable static path
COPY tracker/build/tracker.js /usr/share/nginx/html/static/tracker.js

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
