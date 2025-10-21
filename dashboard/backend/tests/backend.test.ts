import { assert } from "@std/assert";

Deno.test("dashboard backend health check", async () => {
  const response = await fetch("http://localhost:8081/health");
  assert(response.ok);
  const data = await response.json();
  assert(data.ok === true);
  assert(data.service === "dashboard-backend");
});