import React from 'react';
import { Sparkles } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Glow */}
      <div className="w-72 h-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none absolute" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-5">
        {/* Animated Brand Emblem */}
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shadow-orange-500/30 border border-orange-400/40 animate-pulse">
            अ
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-black">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        <div>
          <h2 className="font-heading text-xl font-extrabold tracking-tight text-white">
            ADHYAY
          </h2>
          <p className="text-xs text-orange-400 font-medium tracking-wide">
            Your AI Study Companion
          </p>
        </div>

        {/* Loading Spinner / Pill */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#131620] border border-[#222838] shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
          <span className="text-xs text-gray-400 font-medium">
            Verifying secure session...
          </span>
        </div>
      </div>
    </div>
  );
};
