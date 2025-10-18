/**
 * Shared types and interfaces for the authentication system
 */

export interface CredentialData {
  apiKey: string;
  passphrase: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface SessionData {
  token: string;
  apiKey: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface CredentialResponse {
  apiKey: string;
  passphrase: string;
  expiresIn: number; // minutes
}

export interface SessionResponse {
  token: string;
  expiresIn: number; // minutes
}

/**
 * Abstract storage interface for credentials
 * Allows easy swapping between in-memory and database storage
 */
export interface CredentialStorage {
  store(apiKey: string, data: CredentialData): Promise<void>;
  find(apiKey: string): Promise<CredentialData | null>;
  validate(apiKey: string, passphrase: string): Promise<boolean>;
  delete(apiKey: string): Promise<void>;
  cleanup(): Promise<void>;
}

/**
 * Configuration interface for the authentication system
 */
export interface AuthConfig {
  hmacSecret: string;
  tokenExpiryMinutes: number;
  credentialExpiryHours: number;
  demoAuthPort: number;
}

/**
 * HTTP Request with authentication context
 */
export interface AuthenticatedRequest {
  apiKey?: string;
  token?: string;
  [key: string]: any;
}
