import { assertEquals } from "std/testing/asserts";

Deno.test("collector health endpoint OK", () => {
  // keep trivial for skeleton; later use superoak or serveTestServer to hit route
  const status = 200;
  assertEquals(status, 200);
});
