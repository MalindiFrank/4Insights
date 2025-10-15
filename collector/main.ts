// main.ts - Collector HTTP server
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { FileEventStore, FileSiteStore } from "./utils/storage.ts";
import type { CreateSiteRequest } from "./types.ts";
import { validateEvent } from "./utils/validator.ts";

const store = new FileEventStore("./data");
const siteStore = new FileSiteStore("./data");
await store.init();
await siteStore.init();

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };
}

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

async function handleCollect(req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return json(
        { error: "Expected application/json" },
        415,
        corsHeaders(req.headers.get("origin")),
      );
    }
    const payload = await req.json();
    if (!Array.isArray(payload)) {
      return json(
        { error: "Payload must be an array of events" },
        400,
        corsHeaders(req.headers.get("origin")),
      );
    }
    for (const item of payload) {
      if (!validateEvent(item)) {
        return json(
          { error: "Invalid event in payload" },
          422,
          corsHeaders(req.headers.get("origin")),
        );
      }
    }
    for (const item of payload) {
      await store.append(item);
    }
    return json(
      { ok: true, received: payload.length },
      200,
      corsHeaders(req.headers.get("origin")),
    );
  } catch (err) {
    return json(
      { error: "Bad Request", detail: String(err) },
      400,
      corsHeaders(req.headers.get("origin")),
    );
  }
}

async function handleMetrics(req: Request): Promise<Response> {
  const overview = await store.overview();
  return json(overview, 200, corsHeaders(req.headers.get("origin")));
}

function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}

console.log("4Insights Collector running on http://localhost:8000");
serve((req) => {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(req.headers.get("origin")),
    });
  }
  if (
    req.method === "POST" &&
    (url.pathname === "/4insights/collect" ||
      url.pathname === "/4insights/batch")
  ) {
    return handleCollect(req);
  }
  if (req.method === "GET" && url.pathname === "/4insights/metrics") {
    return handleMetrics(req);
  }
  if (req.method === "POST" && url.pathname === "/4insights/admin/sites") {
    return (async () => {
      try {
        const data = (await req.json()) as CreateSiteRequest;
        if (!data?.name || typeof data.name !== "string") {
          return json(
            { error: "name is required" },
            400,
            corsHeaders(req.headers.get("origin")),
          );
        }
        const site = await siteStore.create(data.name);
        return json({ site }, 201, corsHeaders(req.headers.get("origin")));
      } catch (e) {
        return json(
          { error: "Bad Request", detail: String(e) },
          400,
          corsHeaders(req.headers.get("origin")),
        );
      }
    })();
  }
  return notFound();
}, { port: 8000 });
