export interface VerifyResult {
  valid: boolean;
  apiKey?: string;
  error?: string;
}

export interface MetricsOverview {
  totalEvents: number;
  totalPageviews: number;
  topPaths: Array<{ path: string; count: number }>;
}


