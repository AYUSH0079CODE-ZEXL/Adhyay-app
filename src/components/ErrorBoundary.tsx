import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in ADHYAY component tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      this.setState({ hasError: false, error: null });
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  private handleClearStorageAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0a0c10] text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
          <div className="w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none absolute" />

          <div className="relative z-10 max-w-md w-full bg-[#121620] border border-[#232a3b] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight font-heading">
                ADHYAY encountered an issue
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                An unexpected error occurred while rendering the study workspace. Your data and progress are safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-[#0a0c10] border border-[#1e2433] text-left">
                <p className="text-[11px] font-mono text-orange-400/90 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleClearStorageAndReload}
                className="py-3 px-4 rounded-xl bg-[#1a202c] border border-[#2b3548] text-gray-300 hover:text-white hover:bg-[#222a3a] font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
