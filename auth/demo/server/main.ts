/**
 * Main HTTP server for demo authentication system using Deno standard library
 *
 * Routes:
 * - POST /demo/credentials - Generate new credentials
 * - POST /demo/sessions - Create session (login)
 * - GET /demo/verify - Token validation
 * - DELETE /demo/sessions - Logout
 * - GET /health - Health check
 */

import { CredentialService } from "./CredentialService.ts";
import { SessionService } from "./SessionService.ts";
import { AuthMiddleware } from "./AuthMiddleware.ts";
import { Config } from "./utils/Config.ts";
import { InMemoryCredentialStorage } from "./utils/InMemoryCredentialStorage.ts";

class AuthServer {
  private credentialService!: CredentialService;
  private sessionService!: SessionService;
  private authMiddleware!: AuthMiddleware;
  private config: Config;

  constructor() {
    this.config = Config.getInstance();
    this.setupServices();
  }

  private setupServices(): void {
    const storage = new InMemoryCredentialStorage();
    this.credentialService = new CredentialService(storage, this.config.all);
    this.sessionService = new SessionService(this.config.all);
    this.authMiddleware = new AuthMiddleware(this.sessionService);
  }

  /**
   * Handle HTTP requests using Deno's standard library
   */
  private async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    const origin = req.headers.get("origin");

    // Read allowed origins from single env var (comma separated) for easier deployment config
    const rawAllowed = Deno.env.get("AUTH_ALLOWED_ORIGINS")
      ?? "http://localhost:5173,http://localhost:3000,http://localhost:8010";
    const allowedOrigins = rawAllowed.split(",").map(s => s.trim()).filter(Boolean);

    // Check if origin is allowed (exact match only)
    const isAllowed = origin !== null && allowedOrigins.includes(origin);

    // Build CORS headers - only set Access-Control-Allow-Origin when origin is allowed
    const corsHeaders: Record<string, string> = {
      "Vary": "Origin", // Required for proper caching with credentials
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (isAllowed) {
      corsHeaders["Access-Control-Allow-Origin"] = origin!;
      corsHeaders["Access-Control-Allow-Credentials"] = "true";
    }
    // No else block - don't set Access-Control-Allow-Origin for unauthorized origins

    // Handle preflight requests (return 204 No Content as per spec)
    if (method === "OPTIONS") {
      const headers = new Headers();
      Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
      return new Response(null, { status: 204, headers });
    }

    try {
      // Route handling - capture the Response from handler functions
      let resp: Response;
      if (path === "/health" && method === "GET") {
        resp = this.handleHealthCheck();
      } else if (path === "/demo/credentials" && method === "POST") {
        resp = await this.handleGenerateCredentials();
      } else if (path === "/demo/sessions" && method === "POST") {
        resp = await this.handleCreateSession(req);
      } else if (path === "/demo/verify" && method === "GET") {
        resp = await this.handleVerifyToken(req);
      } else if (path === "/demo/sessions" && method === "DELETE") {
        resp = await this.handleLogout(req);
      } else {
        resp = AuthMiddleware.createErrorResponse("Route not found", 404);
      }

      // Merge CORS headers into the response (only if origin allowed)
      // Important: preserve existing headers and body
      const newHeaders = new Headers(resp.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => {
        // Only set Access-Control-Allow-Origin if origin is allowed
        if (k === "Access-Control-Allow-Origin" && !isAllowed) return;
        newHeaders.set(k, v);
      });

      // Safely clone/return body: read arrayBuffer if body exists
      if (resp.body) {
        const ab = await resp.arrayBuffer();
        return new Response(ab, { status: resp.status, headers: newHeaders });
      } else {
        return new Response(null, { status: resp.status, headers: newHeaders });
      }
    } catch (error) {
      console.error("Request handling error:", error);
      // Ensure error response also carries CORS headers when applicable
      const errResp = AuthMiddleware.createErrorResponse("Internal server error", 500);
      const headers = new Headers(errResp.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => {
        if (k === "Access-Control-Allow-Origin" && !isAllowed) return;
        headers.set(k, v);
      });
      return new Response(await errResp.arrayBuffer(), { status: errResp.status, headers });
    }
  }

  private handleHealthCheck(): Response {
    const data = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      activeSessions: this.sessionService.getActiveSessionsCount(),
    };
    return AuthMiddleware.createSuccessResponse(data);
  }

  private async handleGenerateCredentials(): Promise<Response> {
    try {
      const credentials = await this.credentialService.generateCredentials();
      return AuthMiddleware.createSuccessResponse(
        credentials,
        "Credentials generated successfully",
      );
    } catch (error) {
      console.error(error);
      return AuthMiddleware.createErrorResponse(
        "Failed to generate credentials",
        500,
      );
    }
  }

  private async handleCreateSession(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const { apiKey, passphrase } = body;

      if (!apiKey || !passphrase) {
        return AuthMiddleware.createErrorResponse(
          "API key and passphrase are required",
          400,
        );
      }

      const isValid = await this.credentialService.validateCredentials(
        apiKey,
        passphrase,
      );
      if (!isValid) {
        return AuthMiddleware.createErrorResponse("Invalid credentials", 401);
      }

      const token = await this.sessionService.generateToken(apiKey);
      const data = {
        token,
        expiresIn: this.config.tokenExpiryMinutes,
      };
      return AuthMiddleware.createSuccessResponse(
        data,
        "Session created successfully",
      );
    } catch (error) {
      console.error(error);
      return AuthMiddleware.createErrorResponse(
        "Failed to create session",
        500,
      );
    }
  }

  private async handleVerifyToken(req: Request): Promise<Response> {
    const authResult = await this.authMiddleware.requireAuth(req);

    if (!authResult.apiKey) {
      return AuthMiddleware.handleAuthError(
        authResult.error || "Authentication required",
      );
    }

    const data = {
      apiKey: authResult.apiKey,
      valid: true,
    };
    return AuthMiddleware.createSuccessResponse(data, "Token is valid");
  }

  private async handleLogout(req: Request): Promise<Response> {
    const authResult = await this.authMiddleware.requireAuth(req);

    if (!authResult.apiKey) {
      return AuthMiddleware.handleAuthError(
        authResult.error || "Authentication required",
      );
    }

    const token = req.headers.get("authorization")?.substring(7);
    if (token) {
      this.sessionService.invalidateToken(token);
    }

    return AuthMiddleware.createSuccessResponse(
      null,
      "Session terminated successfully",
    );
  }

  public start(): void {
    const port = this.config.demoAuthPort;
    const handler = (req: Request) => this.handleRequest(req);

    Deno.serve({ port, hostname: "0.0.0.0" }, handler);

    console.log(` Demo Auth Server running on port ${port}`);
    console.log(` Available routes:`);
    console.log(`   POST /demo/credentials - Generate new credentials`);
    console.log(`   POST /demo/sessions - Create session (login)`);
    console.log(`   GET /demo/verify - Verify token`);
    console.log(`   DELETE /demo/sessions - Logout`);
    console.log(`   GET /health - Health check`);
  }

  public stop(): void {
    this.credentialService.stopCleanupScheduler();
    Deno.exit(0);
  }
}

// Start server if this file is run directly
if (import.meta.main) {
  const server = new AuthServer();
  server.start();

  // Graceful shutdown
  Deno.addSignalListener("SIGINT", () => {
    console.log("\n Shutting down server...");
    server.stop();
  });

  Deno.addSignalListener("SIGTERM", () => {
    console.log("\n Shutting down server...");
    server.stop();
  });
}

export { AuthServer };
