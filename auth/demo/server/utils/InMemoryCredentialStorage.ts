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

  store(apiKey: string, data: CredentialData): Promise<void> {
    this.credentials.set(apiKey, data);
    return Promise.resolve();
  }

  find(apiKey: string): Promise<CredentialData | null> {
    return Promise.resolve(this.credentials.get(apiKey) || null);
  }

  validate(apiKey: string, passphrase: string): Promise<boolean> {
    const credential = this.credentials.get(apiKey);
    if (!credential) {
      return Promise.resolve(false);
    }

    // Check if expired
    if (new Date() > credential.expiresAt) {
      this.credentials.delete(apiKey);
      return Promise.resolve(false);
    }

    return Promise.resolve(credential.passphrase === passphrase);
  }

  delete(apiKey: string): Promise<void> {
    this.credentials.delete(apiKey);
    return Promise.resolve();
  }

  cleanup(): Promise<void> {
    const now = new Date();
    for (const [apiKey, credential] of this.credentials.entries()) {
      if (now > credential.expiresAt) {
        this.credentials.delete(apiKey);
      }
    }
    return Promise.resolve();
  }
}
