# Demo Authentication System

A lightweight authentication system built with Deno's standard library for the
4Insights project.

## Features

- **API Key Generation**: Creates unique API keys with format `4insights_` + 12
  random characters
- **Passphrase Authentication**: 4-word passphrases for secure credential
  validation
- **HMAC Token System**: Cryptographically signed tokens with 25-minute
  expiration
- **Session Management**: Automatic cleanup of expired sessions and credentials
- **CORS Support**: Built-in CORS headers for web client integration

## Architecture

```
Tracker → Collector (stores with API key) → Dashboard Backend (filters by API key) → Client (receives pre-filtered data)
```

### Core Services

- **CredentialService**: API key generation, credential management, storage
- **SessionService**: Token generation, validation, session management
- **AuthMiddleware**: HTTP middleware for authentication
- **InMemoryCredentialStorage**: Temporary storage (ready for database
  integration)

## Quick Start

### 1. Start the Auth Server

```bash
cd auth/demo/server
deno run --allow-net --allow-env main.ts
```

The server will start on port 8001 (configurable via `DEMO_AUTH_PORT`
environment variable).

### 2. Test the System

```bash
deno run --allow-net --allow-env tests/auth.test.ts
```

## API Endpoints

### Generate Credentials

```http
POST /demo/credentials
```

**Response:**

```json
{
  "success": true,
  "message": "Credentials generated successfully",
  "data": {
    "apiKey": "4insights_ab12cd34ef56",
    "passphrase": "apple-banana-cherry-dragon",
    "expiresIn": 60
  }
}
```

### Create Session (Login)

```http
POST /demo/sessions
Content-Type: application/json

{
  "apiKey": "4insights_ab12cd34ef56",
  "passphrase": "apple-banana-cherry-dragon"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "token": "eyJwYXlsb2FkIjoi...",
    "expiresIn": 25
  }
}
```

### Verify Token

```http
GET /demo/verify
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "apiKey": "4insights_ab12cd34ef56",
    "valid": true
  }
}
```

### Logout

```http
DELETE /demo/sessions
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Session terminated successfully"
}
```

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "activeSessions": 5
  }
}
```

## Configuration

Set these environment variables to customize the system:

```bash
DEMO_AUTH_PORT=8001                    # Server port
DEMO_HMAC_SECRET=your-secure-secret    # HMAC signing secret
CREDENTIAL_EXPIRY_HOURS=1              # Credential expiration (hours)
TOKEN_EXPIRY_MINUTES=25                # Token expiration (minutes)
```

## Security Features

- **HMAC Signing**: All tokens are cryptographically signed
- **Short Expiration**: Tokens expire in 25 minutes, credentials in 1 hour
- **Automatic Cleanup**: Expired sessions and credentials are automatically
  removed
- **API Key Isolation**: Each API key only accesses its own data

## Integration with Dashboard Backend

The authentication system is designed to work with the dashboard backend:

1. **Collector**: Stores events with API key metadata
2. **Dashboard Backend**: Extracts API key from validated token, filters data
3. **Client**: Receives pre-filtered data, no knowledge of API keys

### Example Backend Integration

```typescript
// In the dashboard backend
const authResult = await authMiddleware.requireAuth(request);
if (!authResult.apiKey) {
  return new Response("Unauthorized", { status: 401 });
}

// Query database with API key filter
const userData = await database.query(
  "SELECT * FROM events WHERE api_key = ?",
  [authResult.apiKey],
);
```

## File Structure

```
auth/demo/server/
├── main.ts              # HTTP server with Deno.serve
├── CredentialService.ts # API key and credential management
├── SessionService.ts    # Token generation and validation
├── AuthMiddleware.ts    # HTTP authentication helpers
├── types.ts            # Server-specific type re-exports
├── utils/
│   ├── Config.ts       # Configuration management
│   └── InMemoryCredentialStorage.ts # Temporary storage
└── tests/
    └── auth.test.ts    # Integration tests

auth/shared/interfaces/
└── types.ts            # Shared interfaces and types
```

## Future Enhancements

- **Database Storage**: Replace in-memory storage with persistent database
- **Rate Limiting**: Add request rate limiting per API key
- **Audit Logging**: Track authentication events
- **Multi-tenant Support**: Enhanced isolation between different users
- **Token Refresh**: Automatic token refresh mechanism

## Development

The system is built with:

- **Deno Standard Library**: No external dependencies
- **TypeScript**: Full type safety
- **OOP Architecture**: Clean separation of concerns
- **Interface-based Design**: Easy to extend and test

Requests: All files are kept under 249 lines, with clear documentation.
