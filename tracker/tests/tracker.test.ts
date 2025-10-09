import { assert } from "https://deno.land/std@0.203.0/testing/asserts.ts";

// small helper function for test
export function createPayload(siteToken: string, type: string, path: string) {
  return {
    site_token: siteToken,
    type,
    path,
    timestamp: new Date().toISOString(),
    meta: {},
  };
}

Deno.test("payload contains required fields", () => {
  const payload = createPayload("public_abc", "pageview", "/home");
  assert(payload.site_token === "public_abc");
  assert(payload.type === "pageview");
  assert(typeof payload.timestamp === "string");
});
