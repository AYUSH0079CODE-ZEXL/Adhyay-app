/**
 * API configuration and route resolver.
 * Handles both local/Cloud Run environments (relative paths)
 * and static GitHub Pages deployments (proxying to the live backend).
 */

export const API_BASE_URL: string = (() => {
  if (typeof window === 'undefined') return '';

  // 1. Explicit environment override
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. If running on GitHub Pages, route API requests to the live backend
  if (window.location.hostname.endsWith('github.io')) {
    return 'https://ais-dev-eyp2rvyxrcisjcwxlopjkk-810560072380.asia-southeast1.run.app';
  }

  // 3. Same-origin deployment (Cloud Run, local dev)
  return '';
})();

export function apiUrl(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${clean}`;
}

// Automatically route relative /api/ requests to the backend when deployed on GitHub Pages
if (typeof window !== 'undefined' && API_BASE_URL) {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = `${API_BASE_URL}${input}`;
    }
    return originalFetch.call(this, input, init);
  };
}

