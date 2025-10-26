import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { assert } from "@std/assert";
import { send } from "../send.ts";

// Mock fetch for testing
const mockFetch = spy((input: string | URL | Request, _init?: RequestInit) => {
  const url = input instanceof Request ? input.url : String(input);
  assert(url === "http://localhost:8080/collect");
  return Promise.resolve(
    new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
});

// Replace global fetch with mock
globalThis.fetch = mockFetch;

Deno.test("payload contains required fields", () => {
  const payload = {
    type: "pageview",
    userId: "test-user",
    sessionId: "test-session",
    page: "Test Page",
    referrer: "",
    timestamp: new Date().toISOString(),
    userAgent: "test-agent",
    language: "en-US",
    screen: "1920x1080",
    timezone: "UTC",
    metadata: {
      url: "http://localhost:3000/test",
      path: "/test",
      host: "localhost:3000",
      hash: "",
      query: "",
    },
  };
  assert(payload.type === "pageview");
  assert(typeof payload.timestamp === "string");
  assert(payload.metadata.path === "/test");
});

Deno.test("event sending", async () => {
  const testEvent = {
    type: "pageview",
    userId: "test-user",
    sessionId: "test-session",
    page: "Test Page",
    referrer: "",
    timestamp: new Date().toISOString(),
    userAgent: "test-agent",
    language: "en-US",
    screen: "1920x1080",
    timezone: "UTC",
    metadata: {
      url: "http://localhost:3000/test",
      path: "/test",
      host: "localhost:3000",
      hash: "",
      query: "",
    },
  };

  await send("test_key_123", testEvent);

  assertSpyCalls(mockFetch, 1);
  assertSpyCall(mockFetch, 0, {
    args: [
      "http://localhost:8080/collect",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer test_key_123",
        },
        body: JSON.stringify(testEvent),
      },
    ],
  });
});
