/**
 * MetricsService - Proxies metrics from Collector, scoped by apiKey (future)
 */

import type { MetricsOverview } from "../types.ts";
import type { Config } from "../utils/Config.ts";

export class MetricsService {
  #collectorUrl: string;

  constructor(config: Config) {
    this.#collectorUrl = `${config.collectorBaseUrl}/4insights/metrics`;
  }

  async fetchOverview(_apiKey: string): Promise<MetricsOverview> {
    // Future: include apiKey filtering once collector supports it
    const res = await fetch(this.#collectorUrl);
    if (!res.ok) {
      throw new Error(`Collector request failed: ${res.status}`);
    }
    return await res.json() as MetricsOverview;
  }
}


