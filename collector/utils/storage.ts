// utils/storage.ts - Simple file-based append-only storage for events
//
// FileEventStore persists events in a newline-delimited JSON file (NDJSON).
// It's easy to inspect and suitable for small deployments or development.
// FileSiteStore provides a minimal site registry for admin functionality.
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import type { AnyEvent, MetricsOverview, Site } from "../types.ts";

export class FileEventStore {
  #dir: string;
  #eventsFile: string;

  constructor(dir: string) {
    this.#dir = dir;
    this.#eventsFile = `${dir}/events.ndjson`;
  }

  async init(): Promise<void> {
    await ensureDir(this.#dir);
    const fileExists = await this.#exists(this.#eventsFile);
    if (!fileExists) {
      await Deno.writeTextFile(this.#eventsFile, "");
    }
  }

  async append(event: AnyEvent): Promise<void> {
    const line = JSON.stringify(event) + "\n";
    await Deno.writeTextFile(this.#eventsFile, line, { append: true });
  }

  async readAll(): Promise<AnyEvent[]> {
    try {
      const text = await Deno.readTextFile(this.#eventsFile);
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      return lines.map((l) => JSON.parse(l));
    } catch (_) {
      return [];
    }
  }

  async metricsTopPaths(
    limit = 10,
  ): Promise<Array<{ path: string; count: number }>> {
    const events = await this.readAll();
    const counts = new Map<string, number>();
    for (const e of events) {
      // Only pageviews for now
      const path = (e as any).metadata?.path ?? "";
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

  async overview(): Promise<MetricsOverview> {
    const events = await this.readAll();
    const totalEvents = events.length;
    const totalPageviews =
      events.filter((e) => (e as any).type === "pageview").length;
    const topPaths = await this.metricsTopPaths();
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
    await ensureDir(this.#dir);
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
