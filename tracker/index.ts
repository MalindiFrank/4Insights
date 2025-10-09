// 4Insights Tracker
// A lightweight client-side tracking library

export interface TrackingPayload {
  site_token: string;
  type: string;
  path: string;
  timestamp: string;
  meta: Record<string, any>;
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
    this.endpoint = config.endpoint || '/api/collect';
  }

  private createPayload(type: string, path: string, meta: Record<string, any> = {}): TrackingPayload {
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
        console.log('4Insights Tracker:', payload);
      }

      // Use sendBeacon for better reliability
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], {
          type: 'application/json',
        });
        navigator.sendBeacon(this.endpoint, blob);
      } else {
        // Fallback to fetch
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('4Insights Tracker Error:', error);
      }
    }
  }

  // Track a page view
  pageview(path?: string, meta: Record<string, any> = {}): void {
    const currentPath = path || window.location.pathname;
    const payload = this.createPayload('pageview', currentPath, meta);
    this.sendPayload(payload);
  }

  // Track a custom event
  event(eventName: string, meta: Record<string, any> = {}): void {
    const payload = this.createPayload('event', window.location.pathname, {
      event_name: eventName,
      ...meta,
    });
    this.sendPayload(payload);
  }

  // Track a conversion
  conversion(conversionName: string, value?: number, meta: Record<string, any> = {}): void {
    const payload = this.createPayload('conversion', window.location.pathname, {
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
  if (typeof window !== 'undefined') {
    // Track initial page view
    tracker.pageview();
    
    // Track page views on navigation (for SPAs)
    let lastPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
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
if (typeof window !== 'undefined') {
  (window as any).Tracker = Tracker;
  (window as any).initTracker = initTracker;
}
