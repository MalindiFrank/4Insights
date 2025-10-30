/**
 * dashboard-backend/main.ts - BFF for 4Insights Dashboard
 *
 * Dependency-free HTTP server using Deno standard library.
 * Responsibilities:
 * - Accept requests from the dashboard frontend
 * - Validate tokens with the Auth service (/demo/verify)
 * - Extract API key from valid token
 * - Query the Collector for metrics filtered by API key (future)
 * - Return filtered data to the frontend
 */

import { Config } from "./utils/Config.ts";
import { AuthClient } from "./services/AuthClient.ts";
import { MetricsService } from "./services/MetricsService.ts";

const config = Config.getInstance();
const authClient = new AuthClient(config);
const metricsService = new MetricsService(config);

function corsHeaders(origin: string | null): HeadersInit {
  // Explicit allowed origins - no wildcards for security
  const allowedOrigins = [
    Deno.env.get("BACKEND_ALLOWED_ORIGIN_1") ?? "http://localhost:5173", // Frontend dev
    Deno.env.get("BACKEND_ALLOWED_ORIGIN_2") ?? "http://localhost:3000", // Frontend prod
  ].filter(Boolean);

  // Check if origin is allowed (exact match only)
  const isAllowed = origin && allowedOrigins.includes(origin);

  if (isAllowed) {
    // Return CORS headers with credentials support for allowed origins
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Vary": "Origin", // Required for proper caching with credentials
    };
  } else {
    // For unauthorized origins, return minimal headers without credentials
    // This prevents CORS attacks while allowing non-credentialed requests
    return {
      "Access-Control-Allow-Origin": allowedOrigins[0], // Safe fallback for dev
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin",
    };
  }
}

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function handleHealth(req: Request): Response {
  return json(
    {
      ok: true,
      service: "dashboard-backend",
      timestamp: new Date().toISOString(),
    },
    200,
    corsHeaders(req.headers.get("origin")),
  );
}

async function handleMetrics(req: Request): Promise<Response> {
  try {
    const origin = req.headers.get("origin");
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;
    if (!token) {
      return json({ success: false, message: "Authentication required" }, 401, corsHeaders(origin));
    }

    const verify = await authClient.verifyToken(token);
    if (!verify.valid || !verify.apiKey) {
      return json({ success: false, message: verify.error ?? "Unauthorized" }, 401, corsHeaders(origin));
    }

    // In future, pass apiKey to collector for filtering once supported
    const metrics = await metricsService.fetchOverview(verify.apiKey);
    return json(metrics, 200, corsHeaders(origin));
  } catch (e) {
    return json({ success: false, message: "Internal Server Error", detail: String(e) }, 500, corsHeaders(req.headers.get("origin")));
  }
}

function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}

console.log(`4Insights Dashboard Backend running on http://localhost:${config.port}`);
Deno.serve({ port: config.port, hostname: "0.0.0.0" }, (req) => {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
  }
  if (req.method === "GET" && url.pathname === "/health") {
    return handleHealth(req);
  }
  if (req.method === "GET" && url.pathname === "/dashboard/metrics") {
    return handleMetrics(req);
  }
  return notFound();
});


