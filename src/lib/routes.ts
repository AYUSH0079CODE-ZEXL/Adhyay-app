/**
 * Route detection and navigation helper for ADHYAY.
 * Fully compatible with standard web routing, GitHub Pages subpaths (/Adhyay-app/),
 * hash-based routing, and query parameters.
 */

export type LegalRoute = 'privacy' | 'terms' | null;

export function getInitialLegalRoute(): LegalRoute {
  if (typeof window === 'undefined') return null;

  // 1. Check if GitHub Pages 404 handler recorded a redirected URL
  try {
    const redirectUrl = sessionStorage.getItem('redirect');
    if (redirectUrl) {
      sessionStorage.removeItem('redirect');
      try {
        // Restore the intended clean path in the browser address bar
        window.history.replaceState(null, '', redirectUrl);
      } catch {}
      const lower = redirectUrl.toLowerCase();
      if (lower.includes('privacy')) return 'privacy';
      if (lower.includes('term')) return 'terms';
    }
  } catch {}

  // 2. Check current path
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith('/privacy-policy') || path.endsWith('/privacy')) {
    return 'privacy';
  }
  if (path.endsWith('/terms') || path.endsWith('/terms-of-service')) {
    return 'terms';
  }

  // 3. Check hash
  const hash = window.location.hash.toLowerCase();
  if (hash.includes('privacy')) {
    return 'privacy';
  }
  if (hash.includes('term')) {
    return 'terms';
  }

  // 4. Check query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const pageParam = searchParams.get('page')?.toLowerCase();
  if (pageParam === 'privacy-policy' || pageParam === 'privacy') {
    return 'privacy';
  }
  if (pageParam === 'terms' || pageParam === 'terms-of-service') {
    return 'terms';
  }

  return null;
}

export function navigateToLegalRoute(route: 'privacy' | 'terms' | 'app') {
  if (typeof window === 'undefined') return;

  if (route === 'privacy') {
    window.location.hash = '/privacy-policy';
  } else if (route === 'terms') {
    window.location.hash = '/terms';
  } else {
    // Clear hash and restore main app
    if (window.location.hash) {
      window.history.pushState(
        '',
        document.title,
        window.location.pathname + window.location.search
      );
    }
  }
}
