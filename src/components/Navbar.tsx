import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Zap,
  Search,
  Timer,
  Sparkles,
  LogOut,
  User as UserIcon,
  Copy,
  Check,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    user,
    setIsSearchOpen,
    setIsSprintOpen,
    setIsTutorOpen,
    setActiveTab,
    logout,
    showToast,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyFriendCode = () => {
    if (user.friendCode) {
      navigator.clipboard.writeText(user.friendCode);
      setHasCopiedCode(true);
      showToast(`Copied friend code: ${user.friendCode}`, 'info');
      setTimeout(() => setHasCopiedCode(false), 2000);
    }
  };

  const nextLevelXP = user.level * 250;
  const prevLevelXP = (user.level - 1) * 250;
  const levelProgress = Math.min(
    Math.max(((user.xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100, 0),
    100
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#1f2430] bg-[#0b0d11]/95 backdrop-blur-md px-3 sm:px-4 lg:px-6 py-2">
      <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-7xl mx-auto">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0 border border-orange-400/30">
              <span className="font-heading font-black text-base sm:text-lg">अ</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  ADHYAY
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.2 text-[9px] font-bold bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-gray-400 -mt-0.5 hidden lg:block">
                Smart Study & Video Lecture Companion
              </p>
            </div>
          </button>
        </div>

        {/* Center: Universal Search Bar (desktop/tablet) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#141720] border border-[#232936] text-gray-400 text-xs hover:border-orange-500/50 hover:bg-[#181d27] transition-all shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate">Search Study Vault, PYQs, Formulas, Doubts...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-gray-400 bg-[#1c2230] border border-[#2d3546] rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Search + Streak + Level + Guru AI + Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1f2c] transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Study Sprint (tablet & desktop) */}
          <button
            onClick={() => setIsSprintOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold hover:bg-orange-500/20 transition-colors cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">30m Sprint</span>
          </button>

          {/* Study Streak */}
          <button
            onClick={() => setActiveTab('levelup')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[#141822] border border-[#232a38] text-xs hover:border-orange-500/40 transition-colors cursor-pointer"
            title={`${user.streakDays} Day Study Streak!`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse shrink-0" />
            <span className="font-bold text-orange-400 font-mono text-xs">{user.streakDays}</span>
            <span className="text-[10px] text-gray-400 hidden xl:inline">d</span>
          </button>

          {/* XP & Level Badge (hidden on smallest screens to protect space) */}
          <button
            onClick={() => setActiveTab('levelup')}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-[#141822] border border-[#232a38] hover:border-amber-500/40 transition-colors cursor-pointer"
            title={`Level ${user.level} (${user.xp} XP)`}
          >
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            <span className="font-bold text-gray-200 text-xs">L{user.level}</span>
          </button>

          {/* AI Tutor Launcher */}
          <button
            onClick={() => setIsTutorOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Guru</span>
          </button>

          {/* User Profile & Account Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 p-0.5 sm:p-1 rounded-xl hover:bg-[#1c2230] border border-transparent hover:border-[#283042] transition-all cursor-pointer"
              title="Account & Profile"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-orange-500/40"
              />
              <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#12151e] border border-[#222838] shadow-2xl p-3 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                {/* User Header */}
                <div className="flex items-start gap-2.5 pb-2.5 border-b border-[#1f2533]">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-orange-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email || 'Supabase Student'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[9px] text-emerald-400 font-semibold">Active Session</span>
                    </div>
                  </div>
                </div>

                {/* Friend Code */}
                {user.friendCode && (
                  <div className="p-2 rounded-xl bg-[#161a24] border border-[#202638] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">
                        Friend Code
                      </span>
                      <span className="text-xs font-mono font-bold text-orange-400">
                        {user.friendCode}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyFriendCode}
                      className="p-1 rounded-lg hover:bg-[#202738] text-gray-400 hover:text-white transition-colors"
                      title="Copy Friend Code"
                    >
                      {hasCopiedCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Academic Quick Info */}
                <div className="text-[11px] text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Curriculum:</span>
                    <span className="font-semibold text-gray-200">{user.boardOrExam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grade:</span>
                    <span className="font-semibold text-gray-200">{user.classGrade}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-1 pt-1 border-t border-[#1f2533]">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-200 hover:bg-[#1a1f2c] transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-orange-400" />
                    <span>Academic Profile & Syllabus</span>
                  </button>

                  <button
                    onClick={async () => {
                      setIsProfileMenuOpen(false);
                      await logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Supabase)</span>
                  </button>

                  <div className="flex items-center justify-between px-2.5 py-1 text-[10px] text-gray-500 border-t border-[#1a202c] pt-2">
                    <button
                      onClick={() => {
                        setActiveTab('privacy');
                        setIsProfileMenuOpen(false);
                      }}
                      className="hover:text-orange-400 transition-colors"
                    >
                      Privacy Policy
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => {
                        setActiveTab('terms');
                        setIsProfileMenuOpen(false);
                      }}
                      className="hover:text-orange-400 transition-colors"
                    >
                      Terms of Service
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
