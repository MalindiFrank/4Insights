/**
 * Types and interfaces for the dashboard frontend
 * 
 * Centralized type definitions following the project's pattern
 * of keeping types in dedicated files for better organization.
 */

/**
 * Authentication credentials for login
 */
export interface AuthCredentials {
  apiKey: string;
  passphrase: string;
}

/**
 * Authentication session data
 */
export interface AuthSession {
  token: string;
  apiKey: string;
  expiresIn: number;
}

/**
 * Authentication error response
 */
export interface AuthError {
  message: string;
  status?: number;
}

/**
 * Dashboard configuration interface
 */
export interface DashboardConfig {
  /** Dashboard Backend (BFF) base URL */
  dashboardBackendUrl: string;
  /** Authentication service base URL */
  authServiceUrl: string;
  /** Collector API base URL */
  collectorUrl: string;
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
 * Top path data structure
 */
export interface TopPath {
  path: string;
  count: number;
}
