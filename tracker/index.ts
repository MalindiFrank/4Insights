// 4Insights Tracker
// A lightweight client-side tracking library

export interface TrackingPayload {
  site_token: string;
  type: string;
  path: string;
  timestamp: string;
  meta: Record<string, unknown>;
}

export interface TrackerConfig {
  siteToken: string;
  endpoint?: string;
  debug?: boolean;
}

export class Tracker {
  private config: TrackerConfig;
  private endpoint: string;

  constructor(config: TrackerConfig) {
    this.config = config;
    this.endpoint = config.endpoint || "/api/collect";
  }

  private createPayload(
    type: string,
    path: string,
    meta: Record<string, unknown> = {},
  ): TrackingPayload {
    return {
      site_token: this.config.siteToken,
      type,
      path,
      timestamp: new Date().toISOString(),
      meta,
    };
  }

  private async sendPayload(payload: TrackingPayload): Promise<void> {
    try {
      if (this.config.debug) {
        console.log("4Insights Tracker:", payload);
      }

      // Use sendBeacon for better reliability
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        navigator.sendBeacon(this.endpoint, blob);
      } else {
        // Fallback to fetch
        await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      if (this.config.debug) {
        console.error("4Insights Tracker Error:", error);
      }
    }
  }

  // Track a page view
  pageview(path?: string, meta: Record<string, unknown> = {}): void {
    const currentPath = path || globalThis.window?.location.pathname || "/";
    const payload = this.createPayload("pageview", currentPath, meta);
    this.sendPayload(payload);
  }

  // Track a custom event
  event(eventName: string, meta: Record<string, unknown> = {}): void {
    const payload = this.createPayload("event", globalThis.window?.location.pathname || "/", {
      event_name: eventName,
      ...meta,
    });
    this.sendPayload(payload);
  }

  // Track a conversion
  conversion(
    conversionName: string,
    value?: number,
    meta: Record<string, unknown> = {},
  ): void {
    const payload = this.createPayload("conversion", globalThis.window?.location.pathname || "/", {
      conversion_name: conversionName,
      value,
      ...meta,
    });
    this.sendPayload(payload);
  }
}

// Global initialization function
export function initTracker(config: TrackerConfig): Tracker {
  const tracker = new Tracker(config);

  // Auto-track page views
  if (typeof globalThis.window !== "undefined") {
    // Track initial page view
    tracker.pageview();

    // Track page views on navigation (for SPAs)
    let lastPath = globalThis.window?.location.pathname || "/";
    const observer = new MutationObserver(() => {
      if (globalThis.window?.location.pathname !== lastPath) {
        lastPath = globalThis.window?.location.pathname || "/";
        tracker.pageview();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  return tracker;
}

// Export for module usage
// (exports are already defined above)

// Global usage (for script tag)
if (typeof globalThis.window !== "undefined") {
  (globalThis.window as unknown as { Tracker: typeof Tracker; initTracker: typeof initTracker }).Tracker = Tracker;
  (globalThis.window as unknown as { Tracker: typeof Tracker; initTracker: typeof initTracker }).initTracker = initTracker;
}
