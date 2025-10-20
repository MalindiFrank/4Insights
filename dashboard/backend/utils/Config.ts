/**
 * Config - Singleton for dashboard backend configuration
 * 
 * Reads configuration from environment variables with sensible defaults
 * for development and production environments.
 */

import type { DashboardBackendConfig } from "../types.ts";

export class Config implements DashboardBackendConfig {
  private static instance: Config;
  readonly authBaseUrl: string;
  readonly collectorBaseUrl: string;
  readonly port: number;

  private constructor() {
    this.authBaseUrl = Deno.env.get("AUTH_BASE_URL") ?? "http://localhost:8001";
    this.collectorBaseUrl = Deno.env.get("COLLECTOR_BASE_URL") ?? "http://localhost:8000";
    this.port = parseInt(Deno.env.get("DASHBOARD_BACKEND_PORT") ?? "8010");
  }

  /**
   * Get singleton config instance
   */
  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config();
    return Config.instance;
  }
}


