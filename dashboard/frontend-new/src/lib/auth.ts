/**
 * Authentication service for the dashboard
 *
 * Handles login, logout, and token management with the auth service.
 * Provides a clean interface for authentication state management.
 */

import { loadConfig } from './config';
import type { AuthCredentials, AuthSession, DashboardConfig } from './types';

/**
 * Authentication service class
 */
export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly API_KEY_KEY = 'auth_api_key';
  private config: DashboardConfig | null = null;

  /**
   * Ensure configuration is loaded
   */
  private async ensureConfig(): Promise<DashboardConfig> {
    if (!this.config) {
      this.config = await loadConfig();
    }
    return this.config;
  }

  /**
   * Generate new credentials from auth service
   */
  async generateCredentials(): Promise<AuthCredentials> {
    const config = await this.ensureConfig();
    const response = await fetch(`${config.authServiceUrl}/demo/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to generate credentials: ${response.status}`);
    }

    const data = await response.json();
    return {
      apiKey: data.data.apiKey,
      passphrase: data.data.passphrase
    };
  }

  /**
   * Login with credentials and get session token
   */
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    const config = await this.ensureConfig();
    const response = await fetch(`${config.authServiceUrl}/demo/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Login failed: ${response.status}`);
    }

    const data = await response.json();
    const session: AuthSession = {
      token: data.data.token,
      apiKey: credentials.apiKey,
      expiresIn: data.data.expiresIn
    };

    // Store session data
    this.storeSession(session);
    return session;
  }

  /**
   * Verify current token with auth service
   */
  async verifyToken(): Promise<{ valid: boolean; apiKey?: string }> {
    const token = this.getStoredToken();
    if (!token) {
      return { valid: false };
    }

    try {
      const config = await this.ensureConfig();
      const response = await fetch(`${config.authServiceUrl}/demo/verify`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (!response.ok) {
        return { valid: false };
      }

      const data = await response.json();
      return {
        valid: data.data?.valid === true,
        apiKey: data.data?.apiKey
      };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    const token = this.getStoredToken();
    if (token) {
      try {
        const config = await this.ensureConfig();
        await fetch(`${config.authServiceUrl}/demo/sessions`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
      } catch {
        // Ignore logout errors
      }
    }
    this.clearSession();
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  /**
   * Get stored authentication token
   */
  getStoredToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  /**
   * Get stored API key
   */
  getStoredApiKey(): string | null {
    return localStorage.getItem(AuthService.API_KEY_KEY);
  }

  /**
   * Store session data in localStorage
   */
  private storeSession(session: AuthSession): void {
    localStorage.setItem(AuthService.TOKEN_KEY, session.token);
    localStorage.setItem(AuthService.API_KEY_KEY, session.apiKey);
  }

  /**
   * Clear session data from localStorage
   */
  private clearSession(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.API_KEY_KEY);
  }
}

/**
 * Singleton auth service instance
 */
export const authService = new AuthService();
