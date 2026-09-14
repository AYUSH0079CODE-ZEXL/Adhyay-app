import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Sparkles,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  Zap,
  Target,
  Clock,
  LogOut,
  ShieldCheck,
  Copy,
  Mail,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const { user, updateUser, toggleWeakTopic, logout, showToast } = useApp();

  const [name, setName] = useState(user.name);
  const [boardOrExam, setBoardOrExam] = useState(user.boardOrExam);
  const [classGrade, setClassGrade] = useState(user.classGrade);
  const [stream, setStream] = useState(user.stream);
  const [targetExam, setTargetExam] = useState(user.targetExam);
  const [targetExamDate, setTargetExamDate] = useState(user.targetExamDate || '2025-02-15');
  const [newWeakTopic, setNewWeakTopic] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      boardOrExam,
      classGrade,
      stream,
      targetExam,
      targetExamDate,
    });
  };

  const handleAddWeakTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeakTopic.trim()) return;
    if (!user.weakTopics.includes(newWeakTopic.trim())) {
      updateUser({
        weakTopics: [...user.weakTopics, newWeakTopic.trim()],
      });
      showToast(`Added "${newWeakTopic}" to weak topics`, 'info');
      setNewWeakTopic('');
    }
  };

  const handleCopyFriendCode = () => {
    if (user.friendCode) {
      navigator.clipboard.writeText(user.friendCode);
      setCopiedCode(true);
      showToast(`Copied friend code: ${user.friendCode}`, 'info');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner with Authenticated Supabase User Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#121622] to-[#171c2b] border border-[#21283a] shadow-xl">
        <div className="flex items-center gap-3.5">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-500/40 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                {user.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>Supabase Verified</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-gray-500" />
              <span>{user.email || 'student@adhyay.edu'}</span>
            </p>
          </div>
        </div>

        {/* Friend Code & Sign Out */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {user.friendCode && (
            <button
              onClick={handleCopyFriendCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1d2332] hover:bg-[#242c3f] border border-[#2c354c] text-xs font-mono font-bold text-orange-400 transition-colors"
              title="Click to copy Friend Code"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{user.friendCode}</span>
            </button>
          )}

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-300 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Profile Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Editable Profile Information */}
        <div className="lg:col-span-2 rounded-3xl bg-[#11141c] border border-[#232938] p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Academic Curriculum Details
              </h3>
              <p className="text-[11px] text-gray-400">
                ADHYAY AI tunes formula sheets, questions, and mark schemes to this syllabus.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Class / Grade</label>
                <input
                  type="text"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  placeholder="e.g. Class 12, Class 11, Dropper"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Board / Exam Body</label>
                <input
                  type="text"
                  value={boardOrExam}
                  onChange={(e) => setBoardOrExam(e.target.value)}
                  placeholder="CBSE, ICSE, State Board, etc."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Stream / Specialization</label>
                <input
                  type="text"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  placeholder="PCM, PCB, PCMB, Commerce, etc."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Primary Exam Target</label>
                <input
                  type="text"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  placeholder="JEE Main 2025, NEET-UG, CBSE Board"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Target Exam Date</label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Weak Topics Manager */}
        <div className="rounded-3xl bg-[#11141c] border border-[#232938] p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading font-bold text-base text-white">
                Weak Topics Management
              </h3>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              ADHYAY AI automatically prioritizes these in your daily study sprints, video notes, and practice tests.
            </p>

            {/* Add Weak Topic Form */}
            <form onSubmit={handleAddWeakTopic} className="flex gap-2">
              <input
                type="text"
                value={newWeakTopic}
                onChange={(e) => setNewWeakTopic(e.target.value)}
                placeholder="Add topic (e.g. Wave Optics, Integration)..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* List of Weak Topics */}
            <div className="space-y-2 pt-2 max-h-60 overflow-y-auto">
              {user.weakTopics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#151924] border border-[#242b3c] text-xs"
                >
                  <span className="text-gray-200 line-clamp-1">{topic}</span>
                  <button
                    onClick={() => toggleWeakTopic(topic)}
                    className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                    title="Remove topic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {user.weakTopics.length === 0 && (
                <p className="text-xs text-gray-400 italic py-2">
                  No weak topics added yet. Add areas you want extra practice on!
                </p>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#151924] border border-[#242b3c] text-xs space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target Readiness</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Estimated exam readiness: <strong className="text-white">92.4%</strong> based on active recall practice and mock tests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
