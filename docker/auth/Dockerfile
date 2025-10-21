FROM denoland/deno:latest

# Use repo root as build context (docker-compose sets context)
WORKDIR /app

# Copy the entire repository so relative imports to ../../shared resolve
COPY . /app

EXPOSE 8001

# Run the demo auth server from its path
CMD ["run", "--allow-net", "--allow-env", "auth/demo/server/main.ts"]
