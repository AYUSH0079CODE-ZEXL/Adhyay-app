import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Award,
  Send,
  RefreshCw,
  Layers,
  Mic,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Flashcard, ActiveRecallEvaluation } from '../types';
import { apiUrl } from '../lib/api';


export const ActiveRecallView: React.FC = () => {
  const { materials, user, addXP, showToast } = useApp();

  const [activeTabMode, setActiveTabMode] = useState<'flashcards' | 'feynman'>('flashcards');
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0] || 'Physics');

  // Flashcards State
  const allCards: Flashcard[] = materials
    .filter((m) => selectedSubject === 'all' || m.subject.toLowerCase() === selectedSubject.toLowerCase())
    .flatMap((m) => m.flashcards || []);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Feynman Evaluator State
  const [feynmanConcept, setFeynmanConcept] = useState('Lenz’s Law & Conservation of Energy');
  const [studentExplanation, setStudentExplanation] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<ActiveRecallEvaluation | null>(null);

  const currentCard = allCards[currentCardIndex] || null;

  const handleRateCard = (rating: 'hard' | 'good' | 'easy') => {
    setIsFlipped(false);
    const xpGain = rating === 'easy' ? 20 : rating === 'good' ? 15 : 10;
    addXP(xpGain, `Reviewed flashcard (${rating})`);

    if (currentCardIndex < allCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      showToast('🎉 All flashcards in this set reviewed!', 'success');
      setCurrentCardIndex(0);
    }
  };

  const handleEvaluateExplanation = async () => {
    if (!studentExplanation.trim()) return;

    setEvaluating(true);
    setEvaluation(null);

    try {
      const res = await fetch(apiUrl('/api/gemini/evaluate-recall'), {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: feynmanConcept,
          studentExplanation,
          subject: selectedSubject,
          academicLevel: user.classGrade || 'Class 12',
        }),
      });

      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        const score = data.evaluation.accuracyScore || 80;
        addXP(Math.round(score * 0.8), 'Active Feynman recall explanation');

        if (score >= 80) {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#f97316', '#ffffff'],
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Evaluation failed. Please retry.', 'warning');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              Active Recall & Feynman Technique
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Don't just re-read notes. Test if you can explain concepts without looking.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#131620] rounded-xl border border-[#232938]">
          <button
            onClick={() => setActiveTabMode('flashcards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTabMode === 'flashcards'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🗂️ Spaced Flashcards ({allCards.length})
          </button>
          <button
            onClick={() => setActiveTabMode('feynman')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTabMode === 'feynman'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🧠 Feynman Oral/Written Test
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#11141c] border border-[#232938]">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Filter Subject:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', ...user.subjects].map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap capitalize transition-colors ${
                  selectedSubject === sub
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold'
                    : 'bg-[#151924] text-gray-400 hover:text-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Flashcard Deck Mode */}
      {activeTabMode === 'flashcards' && (
        <div className="space-y-6">
          {currentCard ? (
            <div className="space-y-4">
              {/* Card Container with Flip Animation */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative min-h-[300px] sm:min-h-[360px] rounded-3xl bg-gradient-to-br from-[#161a25] to-[#12151e] border-2 border-[#262c3e] hover:border-orange-500/50 p-8 flex flex-col justify-between cursor-pointer transition-all shadow-2xl group select-none"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-[11px] font-bold bg-orange-500/15 text-orange-400 rounded-full border border-orange-500/20 uppercase tracking-wider">
                    {currentCard.type}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    Card {currentCardIndex + 1} of {allCards.length}
                  </span>
                </div>

                {/* Card Core Text */}
                <div className="text-center py-6 space-y-3">
                  {!isFlipped ? (
                    <>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Prompt / Question
                      </div>
                      <h3 className="font-heading font-bold text-lg sm:text-2xl text-white max-w-lg mx-auto leading-relaxed">
                        {currentCard.front}
                      </h3>
                      <p className="text-xs text-orange-400/80 pt-4">
                        (Tap anywhere on card to reveal answer)
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Answer & Marking Key
                      </div>
                      <div className="text-sm sm:text-lg text-gray-100 font-medium max-w-lg mx-auto leading-relaxed whitespace-pre-wrap">
                        {currentCard.back}
                      </div>
                    </>
                  )}
                </div>

                {/* Card Footer Indicator */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-[#232938]">
                  <span>{currentCard.chapter}</span>
                  <span className="flex items-center gap-1 group-hover:text-orange-400 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Flip</span>
                  </span>
                </div>
              </div>

              {/* Spaced Repetition Feedback Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleRateCard('hard')}
                  className="flex-1 max-w-[140px] py-2.5 px-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all text-center"
                >
                  Hard (+10 XP)
                </button>
                <button
                  onClick={() => handleRateCard('good')}
                  className="flex-1 max-w-[140px] py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all text-center"
                >
                  Good (+15 XP)
                </button>
                <button
                  onClick={() => handleRateCard('easy')}
                  className="flex-1 max-w-[140px] py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all text-center"
                >
                  Easy (+20 XP)
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#11141c] rounded-2xl border border-[#232938] space-y-3">
              <Layers className="w-10 h-10 text-gray-600 mx-auto" />
              <h3 className="font-heading font-bold text-base text-white">No Flashcards in this Subject</h3>
              <p className="text-xs text-gray-400">
                Upload notes to Study Vault to auto-generate exam flashcards.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. Feynman Evaluator Mode */}
      {activeTabMode === 'feynman' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-[#11141c] border border-[#232938] p-6 space-y-4 shadow-xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">
                Target Concept / Law / Derivation to Explain
              </label>
              <input
                type="text"
                value={feynmanConcept}
                onChange={(e) => setFeynmanConcept(e.target.value)}
                placeholder="e.g. Lenz’s Law, Photoelectric Effect, Nernst Equation"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">
                  Explain it in your own words (as if teaching a junior student):
                </label>
                <span className="text-[11px] text-gray-500">Zero jargon test</span>
              </div>
              <textarea
                rows={5}
                value={studentExplanation}
                onChange={(e) => setStudentExplanation(e.target.value)}
                placeholder="Explain the intuition, conditions, why it happens, and any key formula..."
                className="w-full p-3.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 leading-relaxed"
              />
            </div>

            <button
              onClick={handleEvaluateExplanation}
              disabled={!studentExplanation.trim() || evaluating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
            >
              {evaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Recall & Keyword Accuracy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Evaluate My Explanation</span>
                </>
              )}
            </button>
          </div>

          {/* Evaluation Result Card */}
          {evaluation && (
            <div className="rounded-2xl bg-[#11141c] border border-[#232938] p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
              {/* Score Banner */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1e2330]">
                <div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                    Feynman Recall Score
                  </span>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                    {evaluation.accuracyScore >= 80
                      ? '🎯 Mastered! Exam-Ready Clarity'
                      : evaluation.accuracyScore >= 50
                      ? '⚡ Good Grasp, Minor Nuances Missing'
                      : '⚠️ Concept Incomplete'}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-400">
                    {evaluation.accuracyScore}%
                  </div>
                  <span className="text-[10px] text-gray-400">Conceptual Accuracy</span>
                </div>
              </div>

              {/* Covered vs Missing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Covered */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Key Concepts & Principles You Covered:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-200">
                    {evaluation.keyConceptsCovered.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing */}
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                  <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing Nuances / Exam Keywords:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-200">
                    {evaluation.missingNuances.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Examiner Tip */}
              <div className="p-4 rounded-xl bg-[#151924] border border-[#242b3c] space-y-1 text-xs">
                <div className="font-bold text-orange-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Examiner Advice for 100% Marks:</span>
                </div>
                <p className="text-gray-300 leading-relaxed">{evaluation.examinerTip}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
