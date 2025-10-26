// utils/storage.ts - Simple file-based append-only storage for events
//
// FileEventStore persists events in a newline-delimited JSON file (NDJSON).
// It's easy to inspect and suitable for small deployments or development.
// FileSiteStore provides a minimal site registry for admin functionality.
import type {
  AnyEvent,
  MetricsOverview,
  PageViewEvent,
  Site,
} from "../types.ts";

type StoredEvent = AnyEvent & { _apiKey?: string };
type StoredPageViewEvent = PageViewEvent & { _apiKey?: string };

export class FileEventStore {
  #dir: string;
  #eventsFile: string;

  constructor(dir: string) {
    this.#dir = dir;
    this.#eventsFile = `${dir}/events.ndjson`;
  }

  async init(): Promise<void> {
    await Deno.mkdir(this.#dir, { recursive: true });
    const fileExists = await this.#exists(this.#eventsFile);
    if (!fileExists) {
      await Deno.writeTextFile(this.#eventsFile, "");
    }
  }

  async append(event: AnyEvent, apiKey?: string): Promise<void> {
    const enriched: StoredEvent = { ...event, _apiKey: apiKey };
    const line = JSON.stringify(enriched) + "\n";
    await Deno.writeTextFile(this.#eventsFile, line, { append: true });
  }

  async readAll(): Promise<StoredEvent[]> {
    try {
      const text = await Deno.readTextFile(this.#eventsFile);
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      return lines.map((l) => JSON.parse(l) as StoredEvent);
    } catch (_) {
      return [];
    }
  }

  async metricsTopPaths(
    limit = 10,
    apiKey?: string,
  ): Promise<Array<{ path: string; count: number }>> {
    const events = await this.readAll();
    const counts = new Map<string, number>();
    for (const e of events) {
      if (apiKey && e._apiKey !== apiKey) continue;
      // Only pageviews for now
      if (e.type !== "pageview") continue;
      const path = (e as StoredPageViewEvent).metadata.path;
      if (!path) continue;
      counts.set(path, (counts.get(path) ?? 0) + 1);
    }
    const entries = [...counts.entries()].map(([path, count]) => ({
      path,
      count,
    }));
    entries.sort((a, b) => b.count - a.count);
    return entries.slice(0, limit);
  }

  async overview(apiKey?: string): Promise<MetricsOverview> {
    const events = await this.readAll();
    const filtered = apiKey
      ? events.filter((e) => e._apiKey === apiKey)
      : events;
    const totalEvents = filtered.length;
    const totalPageviews = filtered.filter((e) => e.type === "pageview").length;
    const topPaths = await this.metricsTopPaths(10, apiKey);
    return { totalEvents, totalPageviews, topPaths };
  }

  async #exists(path: string): Promise<boolean> {
    try {
      await Deno.stat(path);
      return true;
    } catch (_) {
      return false;
    }
  }
}

// Minimal Site store for admin operations
export class FileSiteStore {
  #dir: string;
  #sitesFile: string;

  constructor(dir: string) {
    this.#dir = dir;
    this.#sitesFile = `${dir}/sites.json`;
  }

  async init(): Promise<void> {
    await Deno.mkdir(this.#dir, { recursive: true });
    const exists = await this.#exists(this.#sitesFile);
    if (!exists) {
      await Deno.writeTextFile(this.#sitesFile, JSON.stringify([]));
    }
  }

  async list(): Promise<Site[]> {
    try {
      const text = await Deno.readTextFile(this.#sitesFile);
      return JSON.parse(text) as Site[];
    } catch {
      return [];
    }
  }

  async create(name: string): Promise<Site> {
    const sites = await this.list();
    const site: Site = {
      id: crypto.randomUUID(),
      name,
      publicToken: `public_${Math.random().toString(36).slice(2, 10)}`,
      createdAt: new Date().toISOString(),
    };
    sites.push(site);
    await Deno.writeTextFile(this.#sitesFile, JSON.stringify(sites, null, 2));
    return site;
  }

  async #exists(path: string): Promise<boolean> {
    try {
      await Deno.stat(path);
      return true;
    } catch (_) {
      return false;
    }
  }
}
