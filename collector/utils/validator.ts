// utils/validator.ts - Runtime validation for incoming events
//
// These narrow, explicit validators keep the Collector safe against
// malformed input. The goal is friendly error messages and predictable
// processing rather than strict schema tooling.
import type { AnyEvent, PageViewEvent } from "../types.ts";

export function isIsoTimestamp(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function validatePageViewEvent(input: unknown): input is PageViewEvent {
  if (!isRecord(input)) return false;
  const requiredStringFields = [
    "type",
    "userId",
    "sessionId",
    "page",
    "referrer",
    "timestamp",
    "userAgent",
    "language",
    "screen",
    "timezone",
  ];
  for (const key of requiredStringFields) {
    if (typeof input[key] !== "string") return false;
  }
  if (input.type !== "pageview") return false;
  if (!isIsoTimestamp(input.timestamp)) return false;
  if (!isRecord(input.metadata)) return false;
  const md = input.metadata as Record<string, unknown>;
  for (const k of ["url", "path", "host", "hash", "query"]) {
    if (typeof md[k] !== "string") return false;
  }
  if (md.routeParams && !isRecord(md.routeParams)) return false;
  return true;
}

export function validateEvent(input: unknown): input is AnyEvent {
  return validatePageViewEvent(input);
}
