// Utility functions for sending tracking data

export interface TrackingPayload {
  site_token: string;
  type: string;
  path: string;
  timestamp: string;
  meta: Record<string, any>;
}

export interface SendOptions {
  endpoint?: string;
  timeout?: number;
  retries?: number;
}

/**
 * Send tracking payload using the most appropriate method
 */
export async function sendPayload(
  payload: TrackingPayload,
  options: SendOptions = {}
): Promise<boolean> {
  const {
    endpoint = '/api/collect',
    timeout = 5000,
    retries = 2,
  } = options;

  // Try sendBeacon first (most reliable for page unloads)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      });
      return navigator.sendBeacon(endpoint, blob);
    } catch (error) {
      console.warn('sendBeacon failed, falling back to fetch:', error);
    }
  }

  // Fallback to fetch with retries
  return sendWithRetry(payload, endpoint, timeout, retries);
}

/**
 * Send payload with retry logic
 */
async function sendWithRetry(
  payload: TrackingPayload,
  endpoint: string,
  timeout: number,
  retries: number
): Promise<boolean> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return true;
      }

      if (attempt === retries) {
        console.warn('Tracking request failed after retries:', response.status);
        return false;
      }
    } catch (error) {
      if (attempt === retries) {
        console.warn('Tracking request failed after retries:', error);
        return false;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return false;
}

/**
 * Create a tracking payload
 */
export function createPayload(
  siteToken: string,
  type: string,
  path: string,
  meta: Record<string, any> = {}
): TrackingPayload {
  return {
    site_token: siteToken,
    type,
    path,
    timestamp: new Date().toISOString(),
    meta,
  };
}

/**
 * Batch multiple payloads into a single request
 */
export async function sendBatch(
  payloads: TrackingPayload[],
  options: SendOptions = {}
): Promise<boolean> {
  if (payloads.length === 0) return true;

  const {
    endpoint = '/api/collect/batch',
    timeout = 10000,
    retries = 2,
  } = options;

  const batchPayload = {
    payloads,
    timestamp: new Date().toISOString(),
  };

  return sendWithRetry(batchPayload as any, endpoint, timeout, retries);
}
