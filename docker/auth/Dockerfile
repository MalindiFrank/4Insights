FROM denoland/deno:latest

WORKDIR /app

# Copy the auth demo server
COPY auth/demo/server /app

EXPOSE 8001

# Run the demo auth server
CMD ["run", "--allow-net", "--allow-env", "main.ts"]
