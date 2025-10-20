FROM denoland/deno:latest

WORKDIR /app

# Copy collector sources and data
COPY collector /app

VOLUME ["/app/data"]

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "main.ts"]
