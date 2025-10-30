/**
 * Environment configuration for the dashboard frontend
 *
 * Loads configuration from runtime API endpoint (like backend services).
 * This allows environment variables to be injected at runtime without rebuilding.
 */

import type { DashboardConfig } from './types';
import { browser } from '$app/environment';

/**
 * Default configuration (fallback if API fails)
 */
const defaultConfig: DashboardConfig = {
  dashboardBackendUrl: 'http://localhost:8010',
  authServiceUrl: 'http://localhost:8001',
  collectorUrl: 'http://localhost:8000'
};

/**
 * Cached configuration
 */
let cachedConfig: DashboardConfig | null = null;

/**
 * Load configuration from runtime API endpoint
 * This reads environment variables at runtime (server-side)
 */
export async function loadConfig(): Promise<DashboardConfig> {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig;
  }

  // Only fetch in browser context
  if (!browser) {
    return defaultConfig;
  }

  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      console.warn('Failed to load runtime config, using defaults');
      return defaultConfig;
    }

    const config: DashboardConfig = await response.json();
    cachedConfig = config;
    return config;
  } catch (error) {
    console.warn('Error loading runtime config, using defaults:', error);
    return defaultConfig;
  }
}

/**
 * Get configuration synchronously (returns defaults, use loadConfig() for runtime values)
 * @deprecated Use loadConfig() instead for runtime configuration
 */
export function getConfig(): DashboardConfig {
  return cachedConfig || defaultConfig;
}

/**
 * Singleton config instance (defaults only, use loadConfig() for runtime values)
 * @deprecated Use loadConfig() instead for runtime configuration
 */
export const config = defaultConfig;
