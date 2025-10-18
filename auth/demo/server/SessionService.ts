/**
 * SessionService - Handles token generation and session management
 * 
 * Responsibilities:
 * - Generate HMAC-signed tokens
 * - Verify token validity and extract API key
 * - Manage token expiration (25 minutes)
 * - Session lifecycle management
 */

// Using Deno's built-in crypto API
import { SessionData, AuthConfig } from '../../shared/interfaces/types.ts';

export class SessionService {
  private config: AuthConfig;
  private activeSessions: Map<string, SessionData> = new Map();

  constructor(config: AuthConfig) {
    this.config = config;
    this.startSessionCleanup();
  }

  /**
   * Generate a new session token for the given API key
   */
  async generateToken(apiKey: string): Promise<string> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.tokenExpiryMinutes * 60 * 1000);
    
    const payload = {
      apiKey,
      issuedAt: now.getTime(),
      expiresAt: expiresAt.getTime()
    };

    const token = await this.createSignedToken(payload);
    
    const sessionData: SessionData = {
      token,
      apiKey,
      createdAt: now,
      expiresAt
    };

    this.activeSessions.set(token, sessionData);
    return token;
  }

  /**
   * Verify token and return validation result with API key
   */
  async verifyToken(token: string): Promise<{ valid: boolean; apiKey?: string; error?: string }> {
    try {
      // Check if token exists in active sessions
      const session = this.activeSessions.get(token);
      if (!session) {
        return { valid: false, error: 'Token not found' };
      }

      // Check if token is expired
      if (new Date() > session.expiresAt) {
        this.activeSessions.delete(token);
        return { valid: false, error: 'Token expired' };
      }

      // Verify token signature
      const isValidSignature = await this.verifyTokenSignature(token);
      if (!isValidSignature) {
        this.activeSessions.delete(token);
        return { valid: false, error: 'Invalid token signature' };
      }

      return { valid: true, apiKey: session.apiKey };
    } catch (_error) {
      return { valid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Get token expiry date
   */
  getTokenExpiry(token: string): Date | null {
    const session = this.activeSessions.get(token);
    return session ? session.expiresAt : null;
  }

  /**
   * Invalidate a token (logout)
   */
  invalidateToken(token: string): boolean {
    return this.activeSessions.delete(token);
  }

  /**
   * Get all active sessions count
   */
  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Create HMAC-signed token using Deno's crypto API
   */
  private async createSignedToken(payload: Record<string, unknown>): Promise<string> {
    const payloadString = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.config.hmacSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadString));
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const tokenData = {
      payload: payloadString,
      signature: signatureHex
    };

    return btoa(JSON.stringify(tokenData)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Verify token signature using Deno's crypto API
   */
  private async verifyTokenSignature(token: string): Promise<boolean> {
    try {
      // Decode base64url
      const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const tokenData = JSON.parse(atob(padded));
      const { payload, signature } = tokenData;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.config.hmacSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
      const expectedHex = Array.from(new Uint8Array(expectedSignature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Simple string comparison (in production, use timing-safe comparison)
      return signature === expectedHex;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Start automatic session cleanup
   */
  private startSessionCleanup(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of this.activeSessions.entries()) {
      if (now > session.expiresAt) {
        this.activeSessions.delete(token);
      }
    }
  }
}
