/**
 * In-memory storage implementation for credentials
 *
 * Responsibilities:
 * - Store credentials temporarily in memory
 * - Validate API key and passphrase combinations
 * - Handle credential expiration
 * - Clean up expired credentials
 *
 * This is a temporary solution until database integration
 */

import {
  CredentialData,
  CredentialStorage,
} from "../../../shared/interfaces/types.ts";

export class InMemoryCredentialStorage implements CredentialStorage {
  private credentials: Map<string, CredentialData> = new Map();

  async store(apiKey: string, data: CredentialData): Promise<void> {
    this.credentials.set(apiKey, data);
  }

  async find(apiKey: string): Promise<CredentialData | null> {
    return this.credentials.get(apiKey) || null;
  }

  async validate(apiKey: string, passphrase: string): Promise<boolean> {
    const credential = this.credentials.get(apiKey);
    if (!credential) {
      return false;
    }

    // Check if expired
    if (new Date() > credential.expiresAt) {
      this.credentials.delete(apiKey);
      return false;
    }

    return credential.passphrase === passphrase;
  }

  async delete(apiKey: string): Promise<void> {
    this.credentials.delete(apiKey);
  }

  async cleanup(): Promise<void> {
    const now = new Date();
    for (const [apiKey, credential] of this.credentials.entries()) {
      if (now > credential.expiresAt) {
        this.credentials.delete(apiKey);
      }
    }
  }
}
