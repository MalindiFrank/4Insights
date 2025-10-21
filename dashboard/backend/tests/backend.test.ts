import { assert } from "@std/assert";
import { Config } from "../utils/Config.ts";

Deno.test("dashboard backend health check", async () => {
  const config = Config.getInstance();
  const response = await fetch(`http://localhost:${config.port}/health`);
  assert(response.ok);
  const data = await response.json();
  assert(data.ok === true);
  assert(data.service === "dashboard-backend");
});