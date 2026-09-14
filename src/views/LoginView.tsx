import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
  Mail,
  Lock,
  User,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
} from 'lucide-react';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  formatAuthError,
  cleanAuthUrlParams,
  SUPABASE_PROJECT_ID,
  SUPABASE_CALLBACK_URL,
} from '../lib/supabase';

interface LoginViewProps {
  onSuccess?: () => void;
  onOpenLegal?: (route: 'privacy' | 'terms') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess, onOpenLegal }) => {
  // Collapsed email state by default: 'none' (prioritizing Google), or 'signin' / 'signup'
  const [emailFormMode, setEmailFormMode] = useState<'collapsed' | 'signin' | 'signup'>('collapsed');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorContext, setErrorContext] = useState<'google' | 'email' | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);

  // Clean any stale URL params/hashes on initial mount so old errors never linger
  useEffect(() => {
    cleanAuthUrlParams();
    setErrorMessage(null);
    setErrorContext(null);
    setInfoMessage(null);
  }, []);

  // Clear errors when user toggles or edits forms
  const handleSwitchToEmail = (mode: 'signin' | 'signup') => {
    setErrorMessage(null);
    setErrorContext(null);
    setInfoMessage(null);
    setEmailFormMode(mode);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    if (errorMessage) {
      setErrorMessage(null);
      setErrorContext(null);
    }
    setter(val);
  };

  // Google OAuth Flow
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorContext(null);
    setInfoMessage(null);

    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setErrorContext('google');
        if (result.error.message === 'GOOGLE_PROVIDER_DISABLED' || !result.providerEnabled) {
          setErrorMessage("Google Sign-In isn't configured yet. Please try again later or use student email.");
        } else {
          setErrorMessage(formatAuthError(result.error));
        }
      }
    } catch (err: any) {
      setErrorContext('google');
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Email Authentication Flow (Only called upon explicit form submit)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setErrorContext(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please enter both email and password.');
      setErrorContext('email');
      setIsLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setErrorContext('email');
      setIsLoading(false);
      return;
    }

    try {
      if (emailFormMode === 'signup') {
        const cleanName = fullName.trim() || cleanEmail.split('@')[0];
        const { data, error } = await signUpWithEmail(cleanEmail, cleanPassword, cleanName);

        if (error) {
          setErrorMessage(formatAuthError(error));
          setErrorContext('email');
        } else if (data?.session) {
          onSuccess?.();
        } else {
          setInfoMessage('Account created successfully! Signing you in...');
          onSuccess?.();
        }
      } else {
        // Sign In
        const { data, error } = await signInWithEmail(cleanEmail, cleanPassword);
        if (error) {
          setErrorMessage(formatAuthError(error));
          setErrorContext('email');
        } else if (data?.session) {
          onSuccess?.();
        }
      }
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
      setErrorContext('email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(SUPABASE_CALLBACK_URL);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-gray-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-orange-500/25 border border-orange-400/30">
            अ
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading font-extrabold text-base sm:text-xl tracking-tight text-white">
                ADHYAY
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold bg-orange-500/15 text-orange-400 rounded-full border border-orange-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Smart Study Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400 bg-[#121620] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#1f2533]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>CBSE • JEE • NEET • ICSE</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md mx-auto px-4 py-4 sm:py-8 relative z-10 flex-1 flex flex-col justify-center">
        <div className="w-full bg-[#11141c] border border-[#1f2536] rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black/80 space-y-5">
          {/* Card Title & Tagline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Lecture Intelligence</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ADHYAY
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
              Your AI Study Companion for lecture video notes, instant doubt solving, and structured revision.
            </p>
          </div>

          {/* Feedback & Error Notices */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>

              {/* Collapsible Supabase configuration guide when Google Provider is disabled */}
              {errorContext === 'google' && (
                <div className="pt-1 border-t border-red-500/20">
                  <button
                    type="button"
                    onClick={() => setShowSetupGuide((prev) => !prev)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>How to enable Google OAuth in Supabase</span>
                    {showSetupGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showSetupGuide && (
                    <div className="mt-2 p-3 rounded-xl bg-[#0e1017] border border-[#232938] text-[11px] text-gray-300 space-y-2.5">
                      <p className="text-gray-400">
                        To enable real Google Sign-In with Supabase Auth:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-300">
                        <li>
                          Open{' '}
                          <a
                            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/auth/providers`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            Supabase Providers Dashboard <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </li>
                        <li>Click <strong>Google</strong> and toggle <strong>Enable Google</strong> to ON.</li>
                        <li>Paste your <strong>Client ID</strong> and <strong>Client Secret</strong> from Google Cloud Console.</li>
                        <li>
                          In Google Cloud OAuth consent, set the Authorized Redirect URI to:
                        </li>
                      </ol>

                      {/* Callback URL box with copy button */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#161a24] border border-[#262e40] font-mono text-[10px] text-orange-300">
                        <span className="truncate pr-2">{SUPABASE_CALLBACK_URL}</span>
                        <button
                          type="button"
                          onClick={handleCopyCallback}
                          className="p-1 rounded hover:bg-[#202738] text-gray-300 hover:text-white shrink-0"
                          title="Copy Callback URL"
                        >
                          {copiedCallback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <p className="text-[10px] text-gray-400">
                        In the meantime, you can create a student account and sign in immediately below!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Primary Action: Continue with Google */}
          <div className="space-y-3">
            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              type="button"
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-white hover:bg-gray-100 active:scale-[0.99] text-gray-900 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Clean Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-[#1f2638]" />
            <span className="bg-[#11141c] px-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              OR
            </span>
          </div>

          {/* Secondary Email Authentication (Collapsed by default) */}
          {emailFormMode === 'collapsed' ? (
            <button
              type="button"
              onClick={() => handleSwitchToEmail('signin')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#161a24] hover:bg-[#1d2230] border border-[#252c3d] text-xs font-semibold text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-gray-400" />
              <span>Use student email</span>
            </button>
          ) : (
            <div className="space-y-4 pt-1">
              {/* Sign In vs Create Account Toggle Tabs */}
              <div className="flex rounded-xl bg-[#141822] p-1 border border-[#222838]">
                <button
                  type="button"
                  onClick={() => handleSwitchToEmail('signin')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    emailFormMode === 'signin'
                      ? 'bg-orange-500 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchToEmail('signup')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    emailFormMode === 'signup'
                      ? 'bg-orange-500 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Real Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {emailFormMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. Aarav Sharma"
                        value={fullName}
                        onChange={(e) => handleInputChange(setFullName, e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-[#171b26] border border-[#262e42] focus:border-orange-500 rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => handleInputChange(setEmail, e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#171b26] border border-[#262e42] focus:border-orange-500 rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => handleInputChange(setPassword, e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#171b26] border border-[#262e42] focus:border-orange-500 rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <span>
                    {isLoading
                      ? 'Processing...'
                      : emailFormMode === 'signup'
                      ? 'Register & Continue'
                      : 'Sign In to ADHYAY'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailFormMode('collapsed');
                      setErrorMessage(null);
                      setErrorContext(null);
                    }}
                    className="hover:text-gray-200 transition-colors"
                  >
                    ← Back to Google
                  </button>
                  {emailFormMode === 'signup' ? (
                    <button
                      type="button"
                      onClick={() => handleSwitchToEmail('signin')}
                      className="text-orange-400 hover:underline"
                    >
                      Already have an account? Sign in
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitchToEmail('signup')}
                      className="text-orange-400 hover:underline"
                    >
                      Need an account? Register
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Safe Privacy Notice */}
          <div className="pt-2 border-t border-[#1a1f2e] flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Authenticated via Supabase • No onboarding forms</span>
          </div>
        </div>

        {/* 3 Core Value Badges */}
        <div className="grid grid-cols-3 gap-2 mt-4 sm:mt-6">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-[#11141c]/60 border border-[#1d2333] text-center">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto text-orange-400 mb-1" />
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-300">Video Notes</p>
            <p className="text-[8px] sm:text-[9px] text-gray-400 truncate">Formulas & proofs</p>
          </div>
          <div className="p-2 sm:p-2.5 rounded-2xl bg-[#11141c]/60 border border-[#1d2333] text-center">
            <BrainCircuit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto text-amber-400 mb-1" />
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-300">Active Recall</p>
            <p className="text-[8px] sm:text-[9px] text-gray-400 truncate">Examiner evaluation</p>
          </div>
          <div className="p-2 sm:p-2.5 rounded-2xl bg-[#11141c]/60 border border-[#1d2333] text-center">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto text-orange-400 mb-1" />
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-300">Scan & Solve</p>
            <p className="text-[8px] sm:text-[9px] text-gray-400 truncate">Step-by-step marking</p>
          </div>
        </div>
      </main>

      {/* Footer & Legal Links */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-4 text-center text-[11px] text-gray-400 relative z-10 space-y-2">
        <div className="flex items-center justify-center gap-4 text-gray-400">
          <a
            href="#/privacy-policy"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenLegal) {
                onOpenLegal('privacy');
              } else {
                window.location.hash = '/privacy-policy';
              }
            }}
            className="hover:text-orange-400 transition-colors underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>
          <span className="text-gray-600">•</span>
          <a
            href="#/terms"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenLegal) {
                onOpenLegal('terms');
              } else {
                window.location.hash = '/terms';
              }
            }}
            className="hover:text-orange-400 transition-colors underline-offset-4 hover:underline"
          >
            Terms of Service
          </a>
        </div>
        <p className="text-[10px] text-gray-400">
          ADHYAY — Intelligent AI Study Platform for Students &amp; Aspirants
        </p>
      </footer>
    </div>
  );
};
