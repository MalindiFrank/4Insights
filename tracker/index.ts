// tracker/index.ts - InsightTracker TypeScript implementation
//
// InsightTracker captures page views in a privacy-friendly way and sends them
// to the Collector backend. It auto-initializes when loaded via a <script>
// tag that includes a data-key attribute, and also supports manual creation.
import type { PageViewEvent, TrackerConfig } from "./types.ts";

export class InsightTracker {
  private config: TrackerConfig;
  private sessionId: string;
  private userId: string;

  constructor(config: TrackerConfig) {
    this.config = config;
    this.sessionId = this.getOrCreateUserId();
    this.userId = config.userId || this.getOrCreateUserId();
    this.initializeTracker();
  }

  private generateId(): string {
    return "id-" + Math.random().toString(36).substring(2, 9);
  }

  private getOrCreateUserId(): string {
    const storageKey = "insights_user_id";
    try {
      const existing = globalThis.localStorage?.getItem(storageKey);
      if (existing) return existing;
      const created = this.generateId();
      globalThis.localStorage?.setItem(storageKey, created);
      return created;
    } catch {
      return this.generateId();
    }
  }

  private initializeTracker(): void {
    // Send a pageview on first load
    this.trackPageView();
    // Track navigation changes for Single Page Apps
    this.setupSPATracking();
    // Ensure pending data is sent on page unload
    this.setupUnloadTracking();
  }

  private trackPageView(): void {
    // Collect page details and browser info into a typed event
    const event: PageViewEvent = {
      type: "pageview",
      userId: this.userId,
      sessionId: this.sessionId,
      page: globalThis.document?.title ?? "",
      referrer: globalThis.document?.referrer ?? "",
      timestamp: new Date().toISOString(),
      userAgent: globalThis.navigator?.userAgent ?? "",
      language: globalThis.navigator?.language ?? "",
      screen: `${globalThis.screen?.width ?? 0}x${
        globalThis.screen?.height ?? 0
      }`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      metadata: {
        url: globalThis.location?.href ?? "",
        path: globalThis.location?.pathname ?? "/",
        host: globalThis.location?.host ?? "",
        hash: globalThis.location?.hash ?? "",
        query: globalThis.location?.search ?? "",
        routeParams: this.extractRouteParams(),
      },
    };
    this.sendToBackend(event);
  }

  private extractRouteParams(): Record<string, string> {
    const params: Record<string, string> = {};
    try {
      const urlParams = new URLSearchParams(globalThis.location?.search ?? "");
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
    } catch {}
    return params;
  }

  private setupSPATracking(): void {
    // Wrap history APIs to detect client-side route changes
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args: any[]) => {
      originalPushState(...args);
      this.handleRouteChange();
    };
    history.replaceState = (...args: any[]) => {
      originalReplaceState(...args);
      this.handleRouteChange();
    };
    globalThis.addEventListener("popstate", () => this.handleRouteChange());
  }

  private handleRouteChange(): void {
    setTimeout(() => this.trackPageView(), 100);
  }

  private setupUnloadTracking(): void {
    globalThis.addEventListener("beforeunload", () => {
      const events = this.getPendingEvents();
      if (events.length > 0) {
        const blob = new Blob([JSON.stringify(events)], {
          type: "application/json",
        });
        globalThis.navigator?.sendBeacon?.(this.getEndpoint(), blob);
      }
    });
  }

  // For future queued events; currently empty
  private getPendingEvents(): any[] {
    return [];
  }

  private getEndpoint(): string {
    return this.config.endpoint || "/4insights/collect";
  }

  private async sendToBackend(event: PageViewEvent): Promise<void> {
    const body = JSON.stringify([event]);
    const url = this.getEndpoint();
    const beacon = globalThis.navigator?.sendBeacon?.bind(globalThis.navigator);
    if (beacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (beacon(url, blob)) return;
    }
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.config.apiKey,
        },
        body,
        keepalive: true,
      });
    } catch (err) {
      // swallow errors; optionally queue for retry in future
      console.warn("Insights tracker failed to send:", err);
    }
  }
}

declare global {
  interface Window {
    InsightTracker: typeof InsightTracker;
  }
}

globalThis.window && (globalThis.window.InsightTracker = InsightTracker);

const currentScript =
  (globalThis.document?.currentScript as HTMLScriptElement) || undefined;
const apiKey = currentScript?.getAttribute("data-key");
if (apiKey) {
  new InsightTracker({ apiKey });
}
