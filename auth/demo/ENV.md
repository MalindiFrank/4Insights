# Authentication Demo — Environment

This document explains the environment variables used by the demo authentication
service located at `auth/demo`.

Local development: copy `.env.example` to `.env` and edit values.

Required (recommended for development):

- DEMO_AUTH_PORT — HTTP port for the auth server (default: 8001)
- DEMO_HMAC_SECRET — HMAC secret used to sign tokens (change this in any non-dev
  environment)
- CREDENTIAL_EXPIRY_HOURS — How long generated credentials are valid (hours)
- TOKEN_EXPIRY_MINUTES — Token lifetime in minutes

Security note: Do not commit your `.env` file with real secrets to git. Use
environment-specific secret management in production.
