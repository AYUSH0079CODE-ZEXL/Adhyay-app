import React from 'react';
import {
  Flame,
  Zap,
  Clock,
  BookOpen,
  ScanLine,
  FileCheck2,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  Target,
  Trophy,
  Youtube,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HomeDashboardView: React.FC = () => {
  const {
    user,
    setActiveTab,
    setIsSprintOpen,
    setIsUploadOpen,
    setIsTutorOpen,
    dailyMissions,
    completeMission,
    materials,
    setActiveMaterial,
    toggleWeakTopic,
  } = useApp();

  // Target Exam Countdown calculation
  const targetDate = user.targetExamDate ? new Date(user.targetExamDate) : new Date('2025-02-15');
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const daysLeft = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. Exam Countdown & Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#171a25] via-[#1c1a24] to-[#251717] border border-[#2b2736] p-6 sm:p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                {user.boardOrExam} • {user.classGrade}
              </span>
              <span className="text-xs text-gray-400">
                Stream: <strong className="text-gray-200">{user.stream}</strong>
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
              Namaste, {user.name}! 📚
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Targeting <span className="font-bold text-orange-400">{user.targetExam}</span>. Your personalized AI companion simplifies complex concepts, uncovers exam traps, and tracks your retention.
            </p>
          </div>

          {/* Exam Countdown Badge */}
          <div className="flex items-center gap-4 bg-[#0d0f15]/80 backdrop-blur-md p-4 rounded-2xl border border-[#2a2d3c] shadow-lg">
            <div className="text-center px-2">
              <div className="font-heading font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 font-mono">
                {daysLeft}
              </div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Days to Exam
              </div>
            </div>
            <div className="w-[1px] h-10 bg-[#2b3042]" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-orange-400" />
                <span>Exam Target</span>
              </div>
              <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
                {user.targetExam}
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Featured: Learn from Video Lecture */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#17141f] via-[#1a1824] to-[#241718] border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Featured Feature
              </span>
              <span className="px-1.5 py-0.2 rounded bg-orange-500 text-white text-[9px] font-bold">
                NEW
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Learn from Any YouTube Lecture
            </h3>
            <p className="text-xs text-gray-400 max-w-xl">
              Paste any video link to extract syllabus notes, derivations, formulas, interactive timestamps, and test retention with a 10-Q mini-test.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('video')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-orange-500/20"
        >
          <span>Open Video Analyzer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Quick Action Grid (4 Key Power Utilities) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Action 1: Scan & Solve */}
        <button
          onClick={() => setActiveTab('scan')}
          className="p-4 rounded-2xl bg-[#131620] border border-[#232938] hover:border-orange-500/50 hover:bg-[#181d2a] text-left transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs sm:text-sm text-white group-hover:text-orange-400 transition-colors">
                Scan & Solve
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-tight">
              Photo doubt solver with board marking scheme
            </p>
          </div>
        </button>

        {/* Action 2: 30-Min Sprint */}
        <button
          onClick={() => setIsSprintOpen(true)}
          className="p-4 rounded-2xl bg-[#131620] border border-[#232938] hover:border-amber-500/50 hover:bg-[#181d2a] text-left transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors">
                30-Min Sprint
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-tight">
              Fast, high-yield topic crash roadmap
            </p>
          </div>
        </button>

        {/* Action 3: Active Recall */}
        <button
          onClick={() => setActiveTab('recall')}
          className="p-4 rounded-2xl bg-[#131620] border border-[#232938] hover:border-emerald-500/50 hover:bg-[#181d2a] text-left transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors">
                Active Recall
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-tight">
              Feynman oral test & flashcards
            </p>
          </div>
        </button>

        {/* Action 4: Tests & Mocks */}
        <button
          onClick={() => setActiveTab('tests')}
          className="p-4 rounded-2xl bg-[#131620] border border-[#232938] hover:border-blue-500/50 hover:bg-[#181d2a] text-left transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs sm:text-sm text-white group-hover:text-blue-400 transition-colors">
                Mock Tests
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-tight">
              CBSE & JEE style timed tests
            </p>
          </div>
        </button>
      </div>

      {/* 3. Middle Section: Daily Missions & Weak Topics Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Study Missions */}
        <div className="lg:col-span-2 rounded-2xl bg-[#11141c] border border-[#232938] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-sm text-white">
                Daily Study Missions
              </h3>
            </div>
            <span className="text-[11px] text-gray-400">
              Resets every night • Earn XP & Badges
            </span>
          </div>

          <div className="space-y-2.5">
            {dailyMissions.map((mission) => {
              const progressPct = Math.min((mission.progress / mission.target) * 100, 100);
              return (
                <div
                  key={mission.id}
                  onClick={() => {
                    if (!mission.isCompleted) {
                      completeMission(mission.id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    mission.isCompleted
                      ? 'bg-[#141822] border-emerald-500/30 opacity-80'
                      : 'bg-[#161a25] border-[#252b3c] hover:border-orange-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                          mission.isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-gray-600 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          mission.isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'
                        }`}
                      >
                        {mission.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      +{mission.xpReward} XP
                    </div>
                  </div>

                  <div className="w-full bg-[#202738] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        mission.isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-orange-500 to-amber-400'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Weak Areas Spotlight & AI Drill */}
        <div className="rounded-2xl bg-[#11141c] border border-[#232938] p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-sm text-white">
                  Weak Areas Spotlight
                </h3>
              </div>
              <span className="text-[10px] text-gray-400">High Mark Risk</span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Examiners frequently set tricky questions here. Click to launch an instant AI drill.
            </p>

            <div className="space-y-2">
              {user.weakTopics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#161a25] border border-[#252b3c] hover:border-red-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-xs text-gray-200 line-clamp-1">{topic}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsTutorOpen(true);
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 rounded border border-orange-500/30 transition-colors whitespace-nowrap"
                  >
                    Fix Topic
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('recall')}
            className="w-full py-2 px-3 rounded-xl bg-[#171b26] border border-[#282f42] text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#1d2332] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Start Weak Topic Diagnostic Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Recent Study Vault Materials */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-400" />
            <h3 className="font-heading font-bold text-base text-white">
              Recent Study Vault Materials
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('vault')}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <span>View All ({materials.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {materials.slice(0, 3).map((mat) => (
            <div
              key={mat.id}
              onClick={() => {
                setActiveMaterial(mat);
                setActiveTab('vault');
              }}
              className="p-4 rounded-2xl bg-[#11141c] border border-[#232938] hover:border-orange-500/50 hover:bg-[#161a25] transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                    {mat.subject}
                  </span>
                  <span className="text-[10px] text-gray-500 capitalize">{mat.type}</span>
                </div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                  {mat.title}
                </h4>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                  {mat.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1e2330] text-[10px] text-gray-500">
                <span>{mat.notes?.formulaSheet?.length || 0} Formulas • {mat.flashcards?.length || 0} Cards</span>
                <span className="text-orange-400 font-semibold group-hover:underline">Study Now →</span>
              </div>
            </div>
          ))}

          {/* Quick Upload Card */}
          <div
            onClick={() => setIsUploadOpen(true)}
            className="border-2 border-dashed border-[#232a3a] hover:border-orange-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-[#141822] space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-200">Upload New Material</div>
              <p className="text-[11px] text-gray-400 mt-0.5">PDF, Notes, YouTube, or Photos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
