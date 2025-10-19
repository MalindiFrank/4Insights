/**
 * AuthMiddleware - HTTP middleware for authentication using Deno standard library
 *
 * Responsibilities:
 * - Extract and validate tokens from HTTP requests
 * - Provide authentication helpers for route handlers
 * - Handle authentication errors consistently
 */
import { SessionService } from "./SessionService.ts";
import { AuthResponse } from "../../shared/interfaces/types.ts";

export class AuthMiddleware {
  private sessionService: SessionService;

  constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  /**
   * Extract and verify token from Deno Request, returns API key if valid
   */
  async verifyToken(req: Request): Promise<string | null> {
    const token = await this.extractTokenFromRequest(req);
    if (!token) {
      return null;
    }

    const verification = await this.sessionService.verifyToken(token);
    return verification.valid ? verification.apiKey || null : null;
  }

  /**
   * Check if request is authenticated and return API key or null
   */
  async requireAuth(
    req: Request,
  ): Promise<{ apiKey: string | null; error?: string }> {
    const apiKey = await this.verifyToken(req);

    if (!apiKey) {
      return { apiKey: null, error: "Authentication required" };
    }

    return { apiKey };
  }

  /**
   * Optional authentication check (doesn't fail if no token)
   */
  async optionalAuth(req: Request): Promise<string | null> {
    return await this.verifyToken(req);
  }

  /**
   * Extract token from Authorization header or query parameter
   */
  private async extractTokenFromRequest(req: Request): Promise<string | null> {
    // Check Authorization header (Bearer token)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Check query parameter
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get("token");
    if (tokenParam) {
      return tokenParam;
    }

    // Check request body (for POST requests)
    try {
      const body = await req.json();
      if (body && body.token) {
        return body.token;
      }
    } catch {
      // Ignore JSON parsing errors
    }

    return null;
  }

  /**
   * Create standardized error response
   */
  static createErrorResponse(
    message: string,
    statusCode: number = 400,
  ): Response {
    const response: AuthResponse = {
      success: false,
      message,
    };
    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * Create standardized success response
   */
  static createSuccessResponse(
    data: unknown,
    message: string = "Success",
    statusCode: number = 200,
  ): Response {
    const response: AuthResponse = {
      success: true,
      message,
      data,
    };
    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * Handle authentication errors consistently
   */
  static handleAuthError(error: string, statusCode: number = 401): Response {
    return AuthMiddleware.createErrorResponse(error, statusCode);
  }
}
