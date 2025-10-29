# Docker Quick Reference - dashboard-frontend

## 🏗️ Build Commands

### Build the image
```bash
docker build -t dashboard-frontend:latest .
```

### Build with specific tag
```bash
docker build -t dashboard-frontend:v1.0.0 .
```

### Build without cache (fresh build)
```bash
docker build --no-cache -t dashboard-frontend:latest .
```

---

## 🚀 Run Commands

### Run in detached mode (background)
```bash
docker run -d -p 3000:3000 \
  -e VITE_DASHBOARD_BACKEND_URL=http://localhost:8010 \
  -e VITE_AUTH_SERVICE_URL=http://localhost:8001 \
  -e VITE_COLLECTOR_URL=http://localhost:8000 \
  --name dashboard-frontend \
  dashboard-frontend:latest
```

### Run in interactive mode (see logs immediately)
```bash
docker run -it -p 3000:3000 \
  -e VITE_DASHBOARD_BACKEND_URL=http://localhost:8010 \
  -e VITE_AUTH_SERVICE_URL=http://localhost:8001 \
  -e VITE_COLLECTOR_URL=http://localhost:8000 \
  --name dashboard-frontend \
  dashboard-frontend:latest
```

### Run with production environment
```bash
docker run -d -p 3000:3000 \
  -e VITE_DASHBOARD_BACKEND_URL=https://fourinsights-dashboard-backend.onrender.com \
  -e VITE_AUTH_SERVICE_URL=https://fourinsights-auth-demo.onrender.com \
  -e VITE_COLLECTOR_URL=https://fourinsights-collector.onrender.com \
  -e ORIGIN=https://fourinsights-dashboard-frontend.onrender.com \
  --name dashboard-frontend \
  dashboard-frontend:latest
```

### Run with custom port
```bash
docker run -d -p 8080:3000 \
  -e VITE_DASHBOARD_BACKEND_URL=http://localhost:8010 \
  -e VITE_AUTH_SERVICE_URL=http://localhost:8001 \
  -e VITE_COLLECTOR_URL=http://localhost:8000 \
  --name dashboard-frontend \
  dashboard-frontend:latest
```

---

## 📊 Monitoring Commands

### List running containers
```bash
docker ps
```

### List all containers (including stopped)
```bash
docker ps -a
```

### View logs
```bash
docker logs dashboard-frontend
```

### Follow logs (live)
```bash
docker logs -f dashboard-frontend
```

### View last 50 lines of logs
```bash
docker logs --tail 50 dashboard-frontend
```

### Check health status
```bash
docker inspect --format='{{.State.Health.Status}}' dashboard-frontend
```

### View detailed health info
```bash
docker inspect --format='{{json .State.Health}}' dashboard-frontend | python3 -m json.tool
```

### Check resource usage
```bash
docker stats dashboard-frontend
```

---

## 🔧 Management Commands

### Stop container
```bash
docker stop dashboard-frontend
```

### Start stopped container
```bash
docker start dashboard-frontend
```

### Restart container
```bash
docker restart dashboard-frontend
```

### Remove container
```bash
docker rm dashboard-frontend
```

### Force remove running container
```bash
docker rm -f dashboard-frontend
```

### Stop and remove in one command
```bash
docker stop dashboard-frontend && docker rm dashboard-frontend
```

---

## 🐚 Debugging Commands

### Execute command in running container
```bash
docker exec dashboard-frontend ls -la /app
```

### Open shell in running container
```bash
docker exec -it dashboard-frontend sh
```

### Test HTTP endpoint from inside container
```bash
docker exec dashboard-frontend wget -O- http://localhost:3000
```

### Check environment variables
```bash
docker exec dashboard-frontend env
```

### View container details
```bash
docker inspect dashboard-frontend
```

---

## 🖼️ Image Commands

### List images
```bash
docker images
```

### List dashboard-frontend images
```bash
docker images dashboard-frontend
```

### Remove image
```bash
docker rmi dashboard-frontend:latest
```

### Remove all unused images
```bash
docker image prune
```

### Tag image
```bash
docker tag dashboard-frontend:latest dashboard-frontend:v1.0.0
```

### Save image to file
```bash
docker save dashboard-frontend:latest > dashboard-frontend.tar
```

### Load image from file
```bash
docker load < dashboard-frontend.tar
```

---

## 🌐 Registry Commands

### Tag for registry
```bash
docker tag dashboard-frontend:latest your-registry.com/dashboard-frontend:latest
```

### Push to registry
```bash
docker push your-registry.com/dashboard-frontend:latest
```

### Pull from registry
```bash
docker pull your-registry.com/dashboard-frontend:latest
```

---

## 🧹 Cleanup Commands

### Stop all running containers
```bash
docker stop $(docker ps -q)
```

### Remove all stopped containers
```bash
docker container prune
```

### Remove all unused images
```bash
docker image prune -a
```

### Remove all unused volumes
```bash
docker volume prune
```

### Complete cleanup (careful!)
```bash
docker system prune -a --volumes
```

---

## 🔍 Inspection Commands

### View container logs with timestamps
```bash
docker logs -t dashboard-frontend
```

### View container processes
```bash
docker top dashboard-frontend
```

### View container port mappings
```bash
docker port dashboard-frontend
```

### View container network settings
```bash
docker inspect --format='{{.NetworkSettings.IPAddress}}' dashboard-frontend
```

---

## 🧪 Testing Commands

### Test if container is responding
```bash
curl http://localhost:3000
```

### Test with headers
```bash
curl -I http://localhost:3000
```

### Test from another container
```bash
docker run --rm curlimages/curl:latest curl http://host.docker.internal:3000
```

---

## 📦 Docker Compose (Optional)

If you create a `docker-compose.yml`:

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild and restart
```bash
docker-compose up -d --build
```

---

## 💡 Tips

1. **Always use meaningful names** for containers (`--name`)
2. **Use tags** for versioning images
3. **Check logs** when something goes wrong
4. **Use health checks** to monitor container status
5. **Clean up** unused containers and images regularly
6. **Use .dockerignore** to reduce build context size
7. **Multi-stage builds** keep images small
8. **Run as non-root** for security

---

## 🆘 Common Issues

### Port already in use
```bash
# Find what's using the port
sudo lsof -i :3000

# Use a different port
docker run -p 3001:3000 ...
```

### Permission denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Or use sudo
sudo docker ...
```

### Container exits immediately
```bash
# Check logs
docker logs dashboard-frontend

# Run in interactive mode to see errors
docker run -it dashboard-frontend:latest
```

### Out of disk space
```bash
# Clean up
docker system prune -a
```

---

**Quick Start:**
```bash
# Build
docker build -t dashboard-frontend:latest .

# Run
docker run -d -p 3000:3000 --name dashboard-frontend dashboard-frontend:latest

# Check
docker ps
docker logs dashboard-frontend
curl http://localhost:3000

# Stop
docker stop dashboard-frontend && docker rm dashboard-frontend
```

