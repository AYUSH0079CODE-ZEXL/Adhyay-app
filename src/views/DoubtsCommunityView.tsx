import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  ThumbsUp,
  CheckCircle2,
  Send,
  Plus,
  X,
  Camera,
  Bot,
  User,
  HelpCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DoubtPost } from '../types';
import { apiUrl } from '../lib/api';


export const DoubtsCommunityView: React.FC = () => {
  const {
    doubts,
    addDoubt,
    addDoubtAnswer,
    upvoteDoubt,
    markBestAnswer,
    user,
    addXP,
    showToast,
  } = useApp();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [selectedDoubtId, setSelectedDoubtId] = useState<string>(doubts[0]?.id || '');

  // Ask Doubt Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(user.subjects[0] || 'Physics');
  const [newChapter, setNewChapter] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Answer Input State
  const [answerInput, setAnswerInput] = useState('');
  const [generatingAIAnswer, setGeneratingAIAnswer] = useState(false);

  const filteredDoubts = doubts.filter((d) => {
    const matchSubject =
      selectedSubjectFilter === 'all' || d.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();
    const matchSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  const activeDoubt = doubts.find((d) => d.id === selectedDoubtId) || filteredDoubts[0] || null;

  const handlePostDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    addDoubt({
      authorName: user.name,
      authorGrade: `${user.classGrade} (${user.boardOrExam})`,
      authorAvatar: user.avatarUrl,
      title: newTitle,
      description: newDesc,
      subject: newSubject,
      chapter: newChapter || 'General Concept',
      academicLevel: user.classGrade || 'Class 12',
      tags: [newSubject, user.boardOrExam],
    });

    setIsAskModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewChapter('');
  };

  const handleSendAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || !activeDoubt) return;

    addDoubtAnswer(activeDoubt.id, answerInput, false);
    setAnswerInput('');
  };

  const handleGenerateAIAnswer = async () => {
    if (!activeDoubt) return;
    setGeneratingAIAnswer(true);

    try {
      const res = await fetch(apiUrl('/api/gemini/tutor-chat'), {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please provide a clear, step-by-step academic answer to this student's doubt: "${activeDoubt.title}". Details: ${activeDoubt.description}`,
          userProfile: user,
          currentTopic: activeDoubt.subject,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        addDoubtAnswer(activeDoubt.id, data.reply, true);
        showToast('AI Solution generated for this doubt!', 'success');
      }
    } catch (err) {
      console.error(err);
      addDoubtAnswer(
        activeDoubt.id,
        `Here is the standard conceptual breakdown for **${activeDoubt.title}**:\n\n1. Review the fundamental equation.\n2. Ensure standard SI units are maintained throughout calculation.\n3. Verify limiting boundary conditions.`,
        true
      );
    } finally {
      setGeneratingAIAnswer(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              Student Doubts & Academic Community
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Get your tricky doubts resolved by Abhyas AI and peer students across India.
          </p>
        </div>

        <button
          onClick={() => setIsAskModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ask New Doubt (+40 XP)</span>
        </button>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Doubts Feed List */}
        <div className="rounded-2xl bg-[#11141c] border border-[#232938] p-4 space-y-3">
          {/* Search & Subject Filters */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doubts by topic..."
            className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['all', ...user.subjects].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubjectFilter(sub)}
                className={`px-2.5 py-1 text-[11px] rounded-lg whitespace-nowrap capitalize transition-colors ${
                  selectedSubjectFilter === sub
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold'
                    : 'bg-[#151924] text-gray-400 hover:text-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Doubts List */}
          <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
            {filteredDoubts.map((doubt) => {
              const isSelected = activeDoubt?.id === doubt.id;
              return (
                <div
                  key={doubt.id}
                  onClick={() => setSelectedDoubtId(doubt.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#181d29] border-orange-500 shadow-md ring-1 ring-orange-500/30'
                      : 'bg-[#141822] border-[#222838] hover:border-orange-500/40 hover:bg-[#161a25]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                      {doubt.subject}
                    </span>
                    {doubt.isResolved ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Resolved</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500">
                        {doubt.answers.length} answers
                      </span>
                    )}
                  </div>

                  <h4
                    className={`text-xs font-bold line-clamp-2 ${
                      isSelected ? 'text-orange-400' : 'text-gray-200'
                    }`}
                  >
                    {doubt.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                    <span>{doubt.authorName}</span>
                    <div className="flex items-center gap-1 text-gray-400">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{doubt.upvotes}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Active Doubt Thread */}
        <div className="lg:col-span-2 rounded-2xl bg-[#11141c] border border-[#232938] overflow-hidden flex flex-col justify-between min-h-[550px] shadow-xl">
          {activeDoubt ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Question Header & Body */}
              <div className="p-6 border-b border-[#1e2330] space-y-4 bg-[#141720]">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                        {activeDoubt.subject} • {activeDoubt.chapter}
                      </span>
                      {activeDoubt.isResolved && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 rounded">
                          ✓ Best Answer Selected
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading font-bold text-base sm:text-lg text-white">
                      {activeDoubt.title}
                    </h2>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => upvoteDoubt(activeDoubt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      activeDoubt.hasUpvoted
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-[#181d29] border-[#2b3345] text-gray-300 hover:bg-[#202738]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{activeDoubt.upvotes} Upvotes</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {activeDoubt.description}
                </p>

                {/* Author Info & AI Trigger */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-400 border-t border-[#1f2432]">
                  <div className="flex items-center gap-2">
                    <img
                      src={activeDoubt.authorAvatar || user.avatarUrl}
                      alt={activeDoubt.authorName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>
                      Asked by <strong className="text-gray-200">{activeDoubt.authorName}</strong> (
                      {activeDoubt.authorGrade})
                    </span>
                  </div>

                  <button
                    onClick={handleGenerateAIAnswer}
                    disabled={generatingAIAnswer}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500/25 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{generatingAIAnswer ? 'Generating AI Answer...' : 'Ask Guru AI to Answer'}</span>
                  </button>
                </div>
              </div>

              {/* Answers Thread Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Answers ({activeDoubt.answers.length})
                </div>

                {activeDoubt.answers.map((ans) => (
                  <div
                    key={ans.id}
                    className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                      ans.isBestAnswer
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                        : ans.isAI
                        ? 'bg-[#171c28] border-orange-500/30'
                        : 'bg-[#151924] border-[#242b3c]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ans.isAI ? (
                          <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-[#222938] text-gray-300 flex items-center justify-center">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-white">{ans.authorName}</span>
                          <span className="text-[10px] text-gray-400 ml-2">{ans.authorGrade}</span>
                        </div>
                      </div>

                      {ans.isBestAnswer ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-md">
                          ✓ Best Answer
                        </span>
                      ) : (
                        <button
                          onClick={() => markBestAnswer(activeDoubt.id, ans.id)}
                          className="text-[10px] font-semibold text-emerald-400 hover:underline"
                        >
                          Mark as Best Answer (+100 XP)
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-normal">
                      {ans.text}
                    </div>
                  </div>
                ))}

                {activeDoubt.answers.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No answers yet. Be the first to answer and earn +70 XP!
                  </div>
                )}
              </div>

              {/* Bottom Answer Input Form */}
              <form
                onSubmit={handleSendAnswer}
                className="p-4 border-t border-[#1e2330] bg-[#141720] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Contribute your solution or academic hint (+70 XP)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#181c26] border border-[#282f40] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={!answerInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 text-xs">
              Select a doubt to view thread.
            </div>
          )}
        </div>
      </div>

      {/* Ask Doubt Modal */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#11141c] border border-[#232938] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2330]">
              <h3 className="font-heading font-bold text-base text-white">Ask an Academic Doubt</h3>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostDoubt} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Doubt Title / Question</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Why does current lead voltage in a pure capacitor circuit?"
                  className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {user.subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Chapter</label>
                  <input
                    type="text"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    placeholder="e.g. AC Circuits"
                    className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Details / What have you tried?</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain where you are stuck, what step is confusing..."
                  className="w-full p-3 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1e2330]">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow"
                >
                  Post Doubt (+40 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
