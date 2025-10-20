FROM denoland/deno:latest

WORKDIR /app

# Copy backend
COPY dashboard/backend /app

EXPOSE 8010

CMD ["run", "--allow-net", "--allow-env", "main.ts"]
