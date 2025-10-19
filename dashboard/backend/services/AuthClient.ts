/**
 * AuthClient - client to validate tokens via Auth service
 */

import type { VerifyResult } from "../types.ts";
import type { Config } from "../utils/Config.ts";

export class AuthClient {
  #verifyUrl: string;

  constructor(config: Config) {
    this.#verifyUrl = `${config.authBaseUrl}/demo/verify`;
  }

  async verifyToken(token: string): Promise<VerifyResult> {
    const res = await fetch(this.#verifyUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { valid: false, error: `Auth verify failed: ${res.status}` };
    }
    const data = await res.json().catch(() => ({}));
    const apiKey = data?.data?.apiKey ?? null;
    const valid = Boolean(apiKey);
    return valid ? { valid, apiKey } : { valid: false, error: "Invalid token" };
  }
}


