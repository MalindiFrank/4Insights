/**
 * Types and interfaces for the dashboard backend
 * 
 * Centralized type definitions following the project's pattern
 * of keeping types in dedicated files for better organization.
 */

/**
 * Token verification result from auth service
 */
export interface VerifyResult {
  valid: boolean;
  apiKey?: string;
  error?: string;
}

/**
 * Metrics overview data structure
 */
export interface MetricsOverview {
  totalEvents: number;
  totalPageviews: number;
  topPaths: Array<{ path: string; count: number }>;
}

/**
 * Dashboard backend configuration interface
 */
export interface DashboardBackendConfig {
  /** Authentication service base URL */
  authBaseUrl: string;
  /** Collector API base URL */
  collectorBaseUrl: string;
  /** Dashboard backend port */
  port: number;
}