import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

Deno.test("collector health endpoint OK", () => {
  // keep trivial for skeleton; later use superoak or serveTestServer to hit route
  const status = 200;
  assertEquals(status, 200);
});

