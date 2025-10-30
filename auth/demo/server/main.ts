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

    // Explicit allowed origins - no wildcards for security
    const allowedOrigins = [
      Deno.env.get("AUTH_ALLOWED_ORIGIN_1") ?? "http://localhost:5173", // Frontend dev
      Deno.env.get("AUTH_ALLOWED_ORIGIN_2") ?? "http://localhost:3000", // Frontend prod
      Deno.env.get("AUTH_ALLOWED_ORIGIN_3") ?? "http://localhost:8010", // Backend
    ].filter(Boolean);

    // Check if origin is allowed
    const allowedOrigin = origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0]; // Default to first allowed origin

    // Add CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };

    // Handle preflight requests
    if (method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      // Route handling
      if (path === "/health" && method === "GET") {
        return this.handleHealthCheck();
      } else if (path === "/demo/credentials" && method === "POST") {
        return await this.handleGenerateCredentials();
      } else if (path === "/demo/sessions" && method === "POST") {
        return await this.handleCreateSession(req);
      } else if (path === "/demo/verify" && method === "GET") {
        return await this.handleVerifyToken(req);
      } else if (path === "/demo/sessions" && method === "DELETE") {
        return await this.handleLogout(req);
      } else {
        return AuthMiddleware.createErrorResponse("Route not found", 404);
      }
    } catch (error) {
      console.error("Request handling error:", error);
      return AuthMiddleware.createErrorResponse("Internal server error", 500);
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
