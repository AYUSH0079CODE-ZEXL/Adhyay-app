/**
 * API configuration and route resolver.
 * Handles both local/Cloud Run environments (relative paths)
 * and static GitHub Pages deployments (proxying to the live backend).
 */

export const API_BASE_URL: string = (() => {
  if (typeof window === 'undefined') return '';

  // 1. Explicit environment override
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
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
  if (!API_BASE_URL) return clean;
  return `${API_BASE_URL}${clean}`;
}

export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let target = input;
  if (typeof target === 'string' && target.startsWith('/api/')) {
    target = apiUrl(target);
  }
  return fetch(target, init);
}

// Safely attempt to route relative /api/ requests if possible, with zero risk of throwing
if (typeof window !== 'undefined' && API_BASE_URL) {
  try {
    const originalFetch = window.fetch ? window.fetch.bind(window) : null;
    if (originalFetch) {
      const patchedFetch = function (input: RequestInfo | URL, init?: RequestInit) {
        let finalInput = input;
        if (typeof input === 'string' && input.startsWith('/api/')) {
          finalInput = apiUrl(input);
        }
        return originalFetch(finalInput, init);
      };

      try {
        window.fetch = patchedFetch as typeof window.fetch;
      } catch {
        try {
          Object.defineProperty(window, 'fetch', {
            value: patchedFetch,
            writable: true,
            configurable: true,
          });
        } catch {
          // Property is non-configurable / has only getter in this environment
        }
      }
    }
  } catch (e) {
    // Fail silently so module loading never crashes
  }
}
