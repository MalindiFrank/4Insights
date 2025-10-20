# Demo Authentication Service (auth/demo)

This is a small, dependency-free Deno-based demo authentication service used by
the 4Insights project for local development and demos. It provides a simple API
for generating API keys, creating short-lived sessions (token) and verifying
those tokens.

This implementation intentionally uses in-memory credential storage for ease of
development; for production you should replace the storage with a persistent
database and secure secret management.

Quick summary:

- Server: Deno standard library (Deno.serve)
- Purpose: demo auth for dashboard and tracker during local development
- Port: configurable via `DEMO_AUTH_PORT` (default 8001)

Getting started

1. Copy example env and edit if necessary:

```bash
cp auth/demo/.env.example auth/demo/.env
```

2. Run the server (from repo root):

```bash
cd auth/demo/server
deno run --allow-net --allow-env main.ts
```

3. Run the demo tests (optional):

```bash
deno test --allow-net --allow-env auth/demo/server/tests/auth.test.ts
```

ENV and secrets See `auth/demo/.env.example` and `auth/demo/ENV.md` for a
description of environment variables needed to run the service.

API Endpoints

- POST /demo/credentials — generate API key + passphrase
- POST /demo/sessions — obtain a short-lived token using apiKey+passphrase
- GET /demo/verify — verify the token; returns apiKey when valid
- DELETE /demo/sessions — revoke current session token
- GET /health — basic health check

Notes

- This demo service uses an in-memory store for credentials by default. Data
  will be lost on process restart.
- For production use replace in-memory storage and secure the HMAC secret.

File layout

```
auth/demo/server/
├── main.ts
├── CredentialService.ts
├── SessionService.ts
├── AuthMiddleware.ts
├── types.ts
├── utils/
│   ├── Config.ts
│   └── InMemoryCredentialStorage.ts
└── tests/
    └── auth.test.ts
```
