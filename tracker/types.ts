// tracker/types.ts - Interfaces and types for the browser tracker
//
// This file contains only TypeScript interfaces and types used by the
// client-side tracking script. Keeping types separate from logic makes the
// codebase easier to navigate and maintain, especially for beginners.

export interface PageViewEventMetadata {
  /** Full URL of the current page (e.g. https://example.com/about?x=1) */
  url: string;
  /** Path portion of the URL (e.g. /about) */
  path: string;
  /** Host and optional port (e.g. example.com or localhost:5173) */
  host: string;
  /** Hash fragment if present (e.g. #section) */
  hash: string;
  /** Query string including leading ? if present (e.g. ?x=1&y=2) */
  query: string;
  /**
   * Route parameters parsed from the query string. This is a simple
   * key/value representation and can be extended for your router.
   */
  routeParams?: Record<string, string>;
}

export interface PageViewEvent {
  /** The event type; for now only 'pageview' */
  type: "pageview";
  /** Stable user identifier (anonymous); stored in localStorage */
  userId: string;
  /** Session identifier generated for this browser session */
  sessionId: string;
  /** Human-readable page title at the time of tracking */
  page: string;
  /** Referrer URL if available */
  referrer: string;
  /** ISO-8601 timestamp when event was created */
  timestamp: string;
  /** Browser user agent string */
  userAgent: string;
  /** Preferred browser language (e.g. en-US) */
  language: string;
  /** Screen size as WIDTHxHEIGHT (e.g. 1366x768) */
  screen: string;
  /** IANA timezone (e.g. Europe/London) */
  timezone: string;
  /** Additional page and routing details */
  metadata: PageViewEventMetadata;
}

export interface TrackerConfig {
  /** Your public API key used by the tracker */
  apiKey: string;
  /**
   * Collector endpoint to POST events to. Defaults to
   * '/4insights/collect' on the current origin.
   */
  endpoint?: string;
  /** Optional custom user id if you manage identities yourself */
  userId?: string;
}
