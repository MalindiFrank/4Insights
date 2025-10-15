// main.ts - Collector HTTP server
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { FileEventStore } from "./utils/storage.ts";
import { validateEvent } from "./utils/validator.ts";

const store = new FileEventStore("./data");
await store.init();

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
      return json({ error: "Expected application/json" }, 415);
    }
    const payload = await req.json();
    if (!Array.isArray(payload)) {
      return json({ error: "Payload must be an array of events" }, 400);
    }
    for (const item of payload) {
      if (!validateEvent(item)) {
        return json({ error: "Invalid event in payload" }, 422);
      }
    }
    for (const item of payload) {
      await store.append(item);
    }
    return json({ ok: true, received: payload.length });
  } catch (err) {
    return json({ error: "Bad Request", detail: String(err) }, 400);
  }
}

async function handleMetrics(): Promise<Response> {
  const overview = await store.overview();
  return json(overview);
}

function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}

console.log("4Insights Collector running on http://localhost:8000");
serve((req) => {
  const url = new URL(req.url);
  if (req.method === "POST" && url.pathname === "/4insights/collect") {
    return handleCollect(req);
  }
  if (req.method === "GET" && url.pathname === "/4insights/metrics") {
    return handleMetrics();
  }
  return notFound();
}, { port: 8000 });
