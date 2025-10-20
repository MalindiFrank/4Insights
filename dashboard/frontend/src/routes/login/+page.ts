/**
 * Login page server-side logic
 * 
 * Handles server-side redirects and authentication checks
 */

import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/**
 * Page load function for login route
 */
export const load: PageLoad = async ({ url }) => {
  // Check if user is requesting access (from about page)
  const isRequestingAccess = url.searchParams.get('request') === '1';
  
  return {
    isRequestingAccess
  };
};
