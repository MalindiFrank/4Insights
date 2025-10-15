// utils/storage.ts - Simple file-based append-only storage for events
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import type { AnyEvent, MetricsOverview } from "../types.ts";

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
