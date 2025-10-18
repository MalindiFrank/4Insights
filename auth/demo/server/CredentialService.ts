/**
 * CredentialService - Handles API key generation and credential management
 * 
 * Responsibilities:
 * - Generate API keys with format: 4insights_ + 4 + 8 random chars
 * - Generate passphrases (4 random words)
 * - Store and validate credentials
 * - Automatic cleanup of expired credentials
 */

import { CredentialData, CredentialStorage, AuthConfig } from '../../shared/interfaces/types.ts';

export class CredentialService {
  private storage: CredentialStorage;
  private config: AuthConfig;
  private cleanupInterval: number | null = null;

  constructor(storage: CredentialStorage, config: AuthConfig) {
    this.storage = storage;
    this.config = config;
    this.startCleanupScheduler();
  }

  /**
   * Generate new credentials with API key and passphrase
   */
  async generateCredentials(): Promise<{ apiKey: string; passphrase: string; expiresIn: number }> {
    const apiKey = this.generateApiKey();
    const passphrase = this.generatePassphrase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.credentialExpiryHours * 60 * 60 * 1000);

    const credentialData: CredentialData = {
      apiKey,
      passphrase,
      createdAt: now,
      expiresAt
    };

    await this.storage.store(apiKey, credentialData);

    return {
      apiKey,
      passphrase,
      expiresIn: this.config.credentialExpiryHours * 60
    };
  }

  /**
   * Validate credentials (API key and passphrase)
   */
  async validateCredentials(apiKey: string, passphrase: string): Promise<boolean> {
    return await this.storage.validate(apiKey, passphrase);
  }

  /**
   * Revoke credentials by deleting them from storage
   */
  async revokeCredentials(apiKey: string): Promise<void> {
    await this.storage.delete(apiKey);
  }

  /**
   * Clean up expired credentials
   */
  async cleanupExpiredCredentials(): Promise<void> {
    await this.storage.cleanup();
  }

  /**
   * Generate API key with format: 4insights_ + 4 + 8 random alphanumeric chars
   */
  private generateApiKey(): string {
    const prefix = '4insights_';
    const randomChars = this.generateRandomString(12); // 4 + 8 = 12 total
    return prefix + randomChars;
  }

  /**
   * Generate passphrase with 4 random words
   */
  private generatePassphrase(): string {
    const words = [
      '4words', '4phrases', '4jobtracker', '4daily', '4todos', '4expenses',
      '4api', '4weathers', '4taxis', '4lotto', '4brains', '4admin', '360resume',
      '4habits', '4beadings', '4quotes', '4auth', '4vegetables', '4fruits', '4tasks'
    ];
    
    const selectedWords = [];
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWords.push(words[randomIndex]);
    }
    
    return selectedWords.join('-');
  }

  /**
   * Generate random alphanumeric string
   */
  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Start automatic cleanup scheduler
   */
  private startCleanupScheduler(): void {
    // Run cleanup every 20 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCredentials().catch(console.error);
    }, 20 * 60 * 1000);
  }

  /**
   * Stop cleanup scheduler (for graceful shutdown)
   */
  public stopCleanupScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
