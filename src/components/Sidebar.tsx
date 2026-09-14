import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderLock,
  ScanLine,
  FileCheck2,
  BrainCircuit,
  MessageSquare,
  Trophy,
  User,
  UploadCloud,
  Youtube,
  Users,
  MoreHorizontal,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, setIsUploadOpen, user, logout } = useApp();
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const desktopNavItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'video', label: 'Learn from Video', icon: Youtube, badge: 'AI' },
    { id: 'study', label: 'Study Hub', icon: BookOpen },
    { id: 'vault', label: 'Study Vault', icon: FolderLock },
    { id: 'scan', label: 'Scan & Solve', icon: ScanLine, badge: 'Instant' },
    { id: 'tests', label: 'Tests & Mocks', icon: FileCheck2 },
    { id: 'recall', label: 'Active Recall', icon: BrainCircuit },
    { id: 'doubts', label: 'Doubts', icon: MessageSquare },
    { id: 'friends', label: 'Friends & Groups', icon: Users, badge: 'Social' },
    { id: 'levelup', label: 'Level Up', icon: Trophy, badge: `Lvl ${user.level}` },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Primary 4 items for mobile bottom bar
  const mobilePrimaryTabs: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'vault', label: 'Vault', icon: FolderLock },
    { id: 'tests', label: 'Tests', icon: FileCheck2 },
  ];

  // Secondary items accessed via "More"
  const mobileMoreItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    badge?: string;
  }> = [
    { id: 'video', label: 'Learn from Video', icon: Youtube, description: 'YouTube lectures to notes & tests', badge: 'AI' },
    { id: 'scan', label: 'Scan & Solve', icon: ScanLine, description: 'Camera step-by-step problem solver', badge: 'Instant' },
    { id: 'recall', label: 'Active Recall', icon: BrainCircuit, description: 'Spaced repetition flashcards' },
    { id: 'doubts', label: 'Doubts Community', icon: MessageSquare, description: 'Peer Q&A with AI verified answers' },
    { id: 'friends', label: 'Friends & Groups', icon: Users, description: 'Study squads and friend codes', badge: 'Social' },
    { id: 'levelup', label: 'Level Up & Badges', icon: Trophy, description: `XP, Daily streaks & ranks` },
    { id: 'profile', label: 'Academic Profile', icon: User, description: 'Exam target, board, syllabus setup' },
  ];

  const handleSelectMoreItem = (id: NavigationTab) => {
    setActiveTab(id);
    setIsMobileMoreOpen(false);
  };

  const handleMobileLogout = async () => {
    setIsMobileMoreOpen(false);
    await logout();
  };

  const isMoreActive =
    !mobilePrimaryTabs.some((t) => t.id === activeTab) &&
    mobileMoreItems.some((t) => t.id === activeTab);

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 shrink-0 border-r border-[#1f2430] bg-[#0d1016] min-h-[calc(100vh-57px)] p-3 justify-between select-none">
        <div className="space-y-4">
          {/* Quick Action Upload CTA */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Any Material</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#161a24] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-orange-400' : 'text-gray-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isActive
                          ? 'bg-orange-500 text-white'
                          : 'bg-[#1e2433] text-gray-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Student Academic Card & Logout */}
        <div className="space-y-2 pt-3 border-t border-[#1a202c]">
          <div className="p-3 rounded-xl bg-[#141720] border border-[#212735] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                {user.boardOrExam}
              </span>
              <span className="text-[10px] text-gray-400">{user.classGrade}</span>
            </div>
            <div className="text-xs font-semibold text-gray-200 truncate">
              {user.targetExam || 'Target: Board & Entrance'}
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Fixed, Touch-friendly, 5 clean items) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-xl border-t border-[#1f2536] px-2 py-1 flex items-center justify-around h-16 safe-area-bottom">
        {mobilePrimaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMoreOpen(false);
              }}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all ${
                isActive ? 'text-orange-400 font-bold' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-orange-500/15 ring-1 ring-orange-500/30' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-none tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* 5th Item: More */}
        <button
          onClick={() => setIsMobileMoreOpen((prev) => !prev)}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all ${
            isMoreActive || isMobileMoreOpen
              ? 'text-orange-400 font-bold'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isMoreActive || isMobileMoreOpen
                ? 'bg-orange-500/15 ring-1 ring-orange-500/30'
                : ''
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-none tracking-tight">More</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer / Bottom Sheet */}
      {isMobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop click to dismiss */}
          <div
            className="flex-1 w-full"
            onClick={() => setIsMobileMoreOpen(false)}
          />

          <div className="w-full bg-[#11141c] border-t border-[#232938] rounded-t-3xl p-4 sm:p-5 max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2533]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ADHYAY Navigation</h3>
                  <p className="text-[10px] text-gray-400">All tools & academic sections</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white bg-[#1a1f2c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Upload Button */}
            <button
              onClick={() => {
                setIsMobileMoreOpen(false);
                setIsUploadOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 active:scale-95 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Notes / Syllabus / PDF</span>
            </button>

            {/* List of secondary sections */}
            <div className="grid grid-cols-1 gap-1.5">
              {mobileMoreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMoreItem(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-orange-500/15 border border-orange-500/30 text-white'
                        : 'bg-[#151922] hover:bg-[#1a1f2c] border border-[#202636] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isActive
                            ? 'bg-orange-500 text-white'
                            : 'bg-[#1d222e] text-orange-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                );
              })}
            </div>

            {/* User Session & Logout in Mobile Drawer */}
            <div className="pt-2 border-t border-[#1f2533] space-y-2">
              <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-400">
                <span className="truncate max-w-[200px]">{user.email || user.name}</span>
                <span className="text-[10px] text-orange-400 font-mono">Lvl {user.level}</span>
              </div>
              <button
                onClick={handleMobileLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-bold transition-all"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Log Out of ADHYAY</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
