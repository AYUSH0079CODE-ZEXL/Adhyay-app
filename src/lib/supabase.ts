import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Get Supabase credentials from Vite environment or runtime fallback
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://jweocgegjooqgjvkktqd.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_T3WsnmqVz2o7SdHCtkkqwg_YGFoZ0jN';

export const SUPABASE_PROJECT_ID = 'jweocgegjooqgjvkktqd';
export const SUPABASE_CALLBACK_URL = `${SUPABASE_URL}/auth/v1/callback`;

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

/**
 * Friendly error message translator to ensure students never see raw backend JSON or cryptic errors
 */
export function formatAuthError(rawError: any): string {
  if (!rawError) return 'An error occurred. Please try again.';

  const str = typeof rawError === 'string' ? rawError : rawError.message || JSON.stringify(rawError);
  const lower = str.toLowerCase();

  if (
    lower.includes('rate limit') ||
    lower.includes('rate-limit') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('too many requests') ||
    lower.includes('429')
  ) {
    return 'Email authentication is temporarily rate-limited. Please try again later or use Google Sign-In.';
  }

  if (
    lower.includes('unsupported provider') ||
    lower.includes('provider is not enabled') ||
    lower.includes('google_provider_disabled')
  ) {
    return "Google Sign-In isn't configured yet. Please try again later or use student email.";
  }

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid email or password')
  ) {
    return 'Invalid email or password. Please verify your credentials or create a new account.';
  }

  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (lower.includes('password should be at least') || lower.includes('at least 6 characters')) {
    return 'Password must be at least 6 characters long.';
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Please check your email to confirm your account, or contact support.';
  }

  return str;
}

/**
 * Remove any lingering authentication hash tokens or errors from the URL bar
 * so stale errors never persist across page reloads.
 */
export function cleanAuthUrlParams(): { error: string | null; errorDescription: string | null } {
  if (typeof window === 'undefined') return { error: null, errorDescription: null };

  let error: string | null = null;
  let errorDescription: string | null = null;

  try {
    // Check hash for OAuth / Auth errors (e.g. #error=...&error_description=...)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('error') || hashParams.get('error_description')) {
        error = hashParams.get('error');
        errorDescription = hashParams.get('error_description');
      }
    }

    // Check search params
    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('error') || searchParams.get('error_description')) {
        error = error || searchParams.get('error');
        errorDescription = errorDescription || searchParams.get('error_description');
      }
    }

    // Clean URL without reloading if error or tokens are present in hash
    if (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('error') ||
      window.location.hash.includes('refresh_token')
    ) {
      const cleanUrl = window.location.pathname + (window.location.search ? window.location.search : '');
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch (e) {
    console.warn('Could not clean auth URL params:', e);
  }

  return { error, errorDescription };
}

/**
 * Check whether Google OAuth provider is enabled in the Supabase project
 */
export async function checkGoogleProviderStatus(): Promise<{ enabled: boolean; callbackUrl: string; projectId: string }> {
  try {
    const res = await fetch('/api/auth/google-status');
    if (res.ok) {
      const data = await res.json();
      return {
        enabled: !!data.googleEnabled,
        callbackUrl: data.callbackUrl || SUPABASE_CALLBACK_URL,
        projectId: data.projectId || SUPABASE_PROJECT_ID,
      };
    }
  } catch {
    // Direct check to Supabase Auth settings endpoint
    try {
      const settingsRes = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_ANON_KEY },
      });
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        return {
          enabled: !!data?.external?.google,
          callbackUrl: SUPABASE_CALLBACK_URL,
          projectId: SUPABASE_PROJECT_ID,
        };
      }
    } catch {}
  }

  return {
    enabled: false,
    callbackUrl: SUPABASE_CALLBACK_URL,
    projectId: SUPABASE_PROJECT_ID,
  };
}

/**
 * Initiates real Google OAuth with Supabase.
 * If Google provider is not yet enabled in the Supabase project,
 * returns a graceful error to prevent dumping raw JSON error onto the student.
 */
export async function signInWithGoogle(): Promise<{
  error: Error | null;
  providerEnabled?: boolean;
  callbackUrl?: string;
  projectId?: string;
}> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    // Pre-flight check: is Google provider enabled in Supabase?
    const status = await checkGoogleProviderStatus();
    if (!status.enabled) {
      return {
        error: new Error('GOOGLE_PROVIDER_DISABLED'),
        providerEnabled: false,
        callbackUrl: status.callbackUrl,
        projectId: status.projectId,
      };
    }

    // Real Supabase OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error, providerEnabled: true };
    }

    if (data?.url) {
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = data.url;
        } else {
          window.location.href = data.url;
        }
      } catch {
        window.location.href = data.url;
      }
    }

    return { error: null, providerEnabled: true };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Sign in with Email and Password using real Supabase client
 */
export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

/**
 * Sign up with Email, Password and full name.
 * Uses backend registration endpoint (to ensure email is auto-confirmed and avoids SMTP rate limit),
 * then immediately logs the user into Supabase to receive a valid authenticated session.
 */
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const cleanEmail = email.trim().toLowerCase();

  try {
    // Call server registration endpoint
    const regRes = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password, fullName }),
    });

    const regData = await regRes.json();

    if (!regRes.ok || !regData.success) {
      return {
        data: null,
        error: new Error(regData.error || 'Failed to create student account.'),
      };
    }

    // Now sign in to obtain real Supabase session tokens
    const signInResult = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    return signInResult;
  } catch (err: any) {
    // Fallback directly to client-side Supabase signUp if backend was unreachable
    return await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });
  }
}

/**
 * Sign out and clear session state
 */
export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error during signOut:', err);
  } finally {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('abhyas_user');
      } catch {}
    }
  }
}
