import React from 'react';
import {
  Trophy,
  Zap,
  Flame,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LevelUpView: React.FC = () => {
  const { user } = useApp();

  const nextLevelXP = user.level * 250;
  const prevLevelXP = (user.level - 1) * 250;
  const currentXPInLevel = user.xp - prevLevelXP;
  const xpNeededForNext = nextLevelXP - user.xp;
  const levelProgress = Math.min(
    Math.max((currentXPInLevel / (nextLevelXP - prevLevelXP)) * 100, 0),
    100
  );

  const perks = [
    { level: 1, title: 'Study Vault Access', desc: 'Unlimited notes & multi-format breakdowns', unlocked: true },
    { level: 3, title: 'Step-Marking Solver', desc: 'Board-accurate marks scheme extraction', unlocked: user.level >= 3 },
    { level: 5, title: 'AI Exam Style Emulator', desc: 'CBSE & JEE exam pattern mocks', unlocked: user.level >= 5 },
    { level: 8, title: 'Feynman Oral Evaluator', desc: 'Voice-based zero-jargon active recall', unlocked: user.level >= 8 },
    { level: 10, title: 'Top-Ranker Study Sprints', desc: 'Instant 1-hour crash course generator', unlocked: user.level >= 10 },
  ];

  const leaderboard = [
    { rank: 1, name: 'Ananya S.', board: 'CBSE 12th', xp: 4820, streak: 42, level: 19 },
    { rank: 2, name: 'Rohan K.', board: 'JEE 2025', xp: 4210, streak: 35, level: 16 },
    { rank: 3, name: user.name, board: `${user.boardOrExam}`, xp: user.xp, streak: user.streakDays, level: user.level, isUser: true },
    { rank: 4, name: 'Meera P.', board: 'NEET 2025', xp: 1690, streak: 12, level: 7 },
    { rank: 5, name: 'Dev V.', board: 'ISC 12th', xp: 1420, streak: 9, level: 6 },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. Hero Level & XP Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171a25] via-[#201825] to-[#251b14] border border-[#2e263c] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>Level {user.level} Scholar</span>
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Total XP: <strong className="text-white">{user.xp.toLocaleString()} XP</strong>
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Academic Mastery & Gamification
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed">
              Earn XP by completing daily study missions, solving practice tests, recalling flashcards, and resolving doubts.
            </p>
          </div>

          {/* Level Progress Circle / Widget */}
          <div className="bg-[#0e1017]/80 backdrop-blur-md p-5 rounded-2xl border border-[#2b3042] min-w-[240px] space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-300">Level {user.level}</span>
              <span className="text-orange-400">Level {user.level + 1}</span>
            </div>

            <div className="w-full bg-[#1c2230] h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-md shadow-orange-500/30"
                style={{ width: `${levelProgress}%` }}
              />
            </div>

            <div className="text-[11px] text-gray-400 text-center">
              <strong className="text-white font-mono">{xpNeededForNext} XP</strong> needed for Level {user.level + 1}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Badges & Achievements Collection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-400" />
          <h3 className="font-heading font-bold text-lg text-white">
            Badges & Milestones ({user.badges.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.badges.map((badge) => (
            <div
              key={badge.id}
              className="p-5 rounded-2xl bg-[#11141c] border border-[#232938] space-y-3 flex flex-col justify-between hover:border-orange-500/40 transition-all shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{badge.icon}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 rounded">
                  Unlocked
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm text-white">{badge.name || badge.title}</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{badge.description}</p>
              </div>

              <div className="pt-2 border-t border-[#1e2330] text-[10px] text-gray-500">
                Awarded {new Date(badge.unlockedAt).toLocaleDateString()}
              </div>
            </div>
          ))}

          {/* Locked Badge Teaser */}
          <div className="p-5 rounded-2xl bg-[#0f1118] border border-[#1f2432] space-y-3 opacity-60 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-3xl grayscale">🏆</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1d2230] text-gray-400 rounded">
                Locked
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-sm text-gray-300">Centum Master</h4>
              <p className="text-[11px] text-gray-500">Score 100% on 3 full-length mock tests</p>
            </div>
            <div className="pt-2 border-t border-[#1a1f2b] text-[10px] text-gray-600">
              Reward: +300 XP
            </div>
          </div>
        </div>
      </div>

      {/* 3. Level Perks & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Level Progression Perks */}
        <div className="rounded-2xl bg-[#11141c] border border-[#232938] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            <h3 className="font-heading font-bold text-base text-white">
              Level Progression Perks
            </h3>
          </div>

          <div className="space-y-2.5">
            {perks.map((perk) => (
              <div
                key={perk.level}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  perk.unlocked
                    ? 'bg-[#151924] border-[#252c3c]'
                    : 'bg-[#0f1118] border-[#1d2230] opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                      perk.unlocked
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#1c2230] text-gray-500'
                    }`}
                  >
                    L{perk.level}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{perk.title}</div>
                    <div className="text-[11px] text-gray-400">{perk.desc}</div>
                  </div>
                </div>

                {perk.unlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: All-India Study Leaderboard */}
        <div className="rounded-2xl bg-[#11141c] border border-[#232938] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="font-heading font-bold text-base text-white">
                All-India Study Leaderboard
              </h3>
            </div>
            <span className="text-[10px] text-gray-400">Weekly Refresh</span>
          </div>

          <div className="space-y-2">
            {leaderboard.map((item) => (
              <div
                key={item.rank}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  item.isUser
                    ? 'bg-orange-500/15 border-orange-500 ring-1 ring-orange-500/30'
                    : 'bg-[#151924] border-[#242b3c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                      item.rank === 1
                        ? 'bg-amber-400 text-black'
                        : item.rank === 2
                        ? 'bg-gray-300 text-black'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.rank}
                  </span>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      {item.isUser && (
                        <span className="px-1.5 py-0.2 text-[9px] bg-orange-500 text-white font-bold rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{item.board}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-orange-400">
                    {item.xp.toLocaleString()} XP
                  </div>
                  <span className="text-[10px] text-gray-400">{item.streak}d streak</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
