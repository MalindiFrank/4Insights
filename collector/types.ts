// types.ts - Shared types for Collector and Tracker
//
// This file defines data contracts used by the backend Collector service
// and, where appropriate, shared understanding with the Tracker. Keeping
// interfaces in a dedicated file improves readability and maintainability.

export interface PageViewEventMetadata {
  /** Full URL of the page when the event was created */
  url: string;
  /** Path portion of the URL (e.g. /, /about) */
  path: string;
  /** Host and optional port (e.g. example.com or localhost:8000) */
  host: string;
  /** Hash fragment if present (e.g. #top) */
  hash: string;
  /** Query string beginning with ? if present */
  query: string;
  /** Optional key/value route parameters extracted from the URL */
  routeParams?: Record<string, string>;
}

export interface PageViewEvent {
  type: "pageview";
  /** Anonymous, stable user identifier */
  userId: string;
  /** Session identifier for the current visit */
  sessionId: string;
  /** Human-readable page title */
  page: string;
  /** Referrer URL if available */
  referrer: string;
  /** ISO timestamp when the event was created in the browser */
  timestamp: string;
  /** Browser user agent string */
  userAgent: string;
  /** Preferred browser language (e.g. en-US) */
  language: string;
  /** Screen size formatted as WIDTHxHEIGHT */
  screen: string;
  /** IANA timezone identifier (e.g. UTC) */
  timezone: string;
  /** Additional URL details */
  metadata: PageViewEventMetadata;
}

export type AnyEvent = PageViewEvent; // Ready for future event types

export interface TrackerConfig {
  apiKey: string;
  endpoint?: string;
  userId?: string;
}

export interface CollectorConfig {
  /** Directory path where file-based storage should be placed */
  storagePath: string;
}

export interface MetricsOverview {
  /** Total events collected (across all types) */
  totalEvents: number;
  /** Total pageview events */
  totalPageviews: number;
  /** Highest-traffic paths and their counts */
  topPaths: Array<{ path: string; count: number }>;
}

// Admin and site management types
export interface Site {
  id: string; // generated
  name: string;
  publicToken: string; // used by tracker
  createdAt: string;
}

export interface CreateSiteRequest {
  /** Human-friendly site name shown in the dashboard */
  name: string;
}

export interface CreateSiteResponse {
  /** The newly created site configuration */
  site: Site;
}
