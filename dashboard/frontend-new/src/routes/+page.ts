// Disable prerendering - this page requires runtime authentication
// and makes dynamic API calls to load metrics
export const prerender = false;
export const ssr = false; // Client-side only for auth checks
