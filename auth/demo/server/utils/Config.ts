/**
 * Configuration management for the authentication system
 * 
 * Responsibilities:
 * - Read environment variables with defaults
 * - Provide centralized configuration access
 * - Singleton pattern for consistent configuration
 */

import { AuthConfig } from '../../../shared/interfaces/types.ts';

export class Config {
  private static instance: Config;
  private config: AuthConfig;

  private constructor() {
    this.config = {
      hmacSecret: this.getEnvVar('DEMO_HMAC_SECRET', 'default-secret-key-change-in-production'),
      tokenExpiryMinutes: parseInt(this.getEnvVar('TOKEN_EXPIRY_MINUTES', '25')),
      credentialExpiryHours: parseInt(this.getEnvVar('CREDENTIAL_EXPIRY_HOURS', '1')),
      demoAuthPort: parseInt(this.getEnvVar('DEMO_AUTH_PORT', '8001'))
    };
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public get hmacSecret(): string {
    return this.config.hmacSecret;
  }

  public get tokenExpiryMinutes(): number {
    return this.config.tokenExpiryMinutes;
  }

  public get credentialExpiryHours(): number {
    return this.config.credentialExpiryHours;
  }

  public get demoAuthPort(): number {
    return this.config.demoAuthPort;
  }

  public get all(): AuthConfig {
    return { ...this.config };
  }

  private getEnvVar(name: string, defaultValue: string): string {
    return Deno.env.get(name) || defaultValue;
  }
}
