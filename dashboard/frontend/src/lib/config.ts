/**
 * Environment configuration for the dashboard frontend
 * 
 * Reads configuration from environment variables with sensible defaults
 * for development and production environments.
 */

import type { DashboardConfig } from './types.ts';

/**
 * Get configuration from environment variables with fallbacks
 */
export function getConfig(): DashboardConfig {
  return {
    dashboardBackendUrl: import.meta.env.VITE_DASHBOARD_BACKEND_URL || 'http://localhost:8010',
    authServiceUrl: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8001',
    collectorUrl: import.meta.env.VITE_COLLECTOR_URL || 'http://localhost:8000'
  };
}

/**
 * Singleton config instance
 */
export const config = getConfig();
