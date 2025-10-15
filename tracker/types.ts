// tracker/types.ts - Interfaces and types for the browser tracker

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

export interface TrackerConfig {
  apiKey: string;
  endpoint?: string;
  userId?: string;
}
