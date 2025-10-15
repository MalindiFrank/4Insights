// types.ts - Shared types for Collector and Tracker

export interface PageViewEventMetadata {
  url: string;
  path: string;
  host: string;
  hash: string;
  query: string;
  routeParams?: Record<string, string>;
}

export interface PageViewEvent {
  type: "pageview";
  userId: string;
  sessionId: string;
  page: string;
  referrer: string;
  timestamp: string;
  userAgent: string;
  language: string;
  screen: string;
  timezone: string;
  metadata: PageViewEventMetadata;
}

export type AnyEvent = PageViewEvent; // Ready for future event types

export interface TrackerConfig {
  apiKey: string;
  endpoint?: string;
  userId?: string;
}

export interface CollectorConfig {
  storagePath: string;
}

export interface MetricsOverview {
  totalEvents: number;
  totalPageviews: number;
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
  name: string;
}

export interface CreateSiteResponse {
  site: Site;
}
