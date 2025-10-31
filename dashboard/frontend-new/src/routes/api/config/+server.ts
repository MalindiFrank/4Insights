/**
 * Runtime configuration endpoint
 * 
 * This endpoint reads environment variables at runtime (like backend services)
 * and serves them to the client. This allows changing URLs without rebuilding.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../../../../.svelte-kit/types/src/routes/api/config/$types.d.ts';

export const GET: RequestHandler = () => {
  // Read environment variables at runtime
  // These can be set via .env file or injected by the hosting platform
  const config = {
    dashboardBackendUrl: process.env.DASHBOARD_BACKEND_URL || 
                        'http://localhost:8010',
    authServiceUrl: process.env.AUTH_SERVICE_URL || 
                   'http://localhost:8001',
    collectorUrl: process.env.COLLECTOR_URL || 
                 'http://localhost:8000'
  };

  return json(config);
};

