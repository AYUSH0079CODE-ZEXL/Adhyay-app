import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Trophy,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronRight,
  BookOpen,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Question, MockTest, QuestionType, Difficulty } from '../types';
import { apiUrl } from '../lib/api';


export const TestsMocksView: React.FC = () => {
  const { user, pyqBank, completedTests, addCompletedTest, addXP, showToast } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'create' | 'pyqs' | 'history'>('create');
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0] || 'Physics');
  const [chapter, setChapter] = useState('Current Electricity & Kirchhoff Laws');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [examStyle, setExamStyle] = useState<string>('CBSE 12th Board Standard');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [generating, setGenerating] = useState(false);

  // Active Test State
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);

  // PYQ Bank Filter
  const [pyqSearch, setPyqSearch] = useState('');
  const [pyqSubject, setPyqSubject] = useState<string>('all');

  // Test countdown timer
  useEffect(() => {
    if (!activeTest || isTestSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTest, isTestSubmitted, timeLeft]);

  const handleGenerateTest = async () => {
    setGenerating(true);
    try {
      const res = await fetch(apiUrl('/api/gemini/generate-questions'), {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          chapter,
          count: questionCount,
          difficulty,
          questionTypes: ['mcq', 'numerical', 'assertion_reason'],
          academicLevel: user.classGrade || 'Class 12',
          targetExam: user.targetExam || user.boardOrExam,
        }),
      });

      const data = await res.json();
      const questions: Question[] = data.questions || [];

      if (questions.length === 0) {
        showToast('Using high-yield practice bank questions', 'info');
        // Fallback to pyq bank slice
        const fallbackQs = pyqBank.slice(0, questionCount);
        startTestWithQuestions(fallbackQs);
        return;
      }

      startTestWithQuestions(questions);
    } catch (err) {
      console.error(err);
      showToast('Loaded curated exam questions', 'info');
      startTestWithQuestions(pyqBank.slice(0, questionCount));
    } finally {
      setGenerating(false);
    }
  };

  const startTestWithQuestions = (questions: Question[]) => {
    const totalTimeMins = questions.length * 3;
    const newTest: MockTest = {
      id: `test_${Date.now()}`,
      title: `${selectedSubject}: ${chapter || 'Speed Mock'}`,
      subject: selectedSubject,
      chapter: chapter || 'Exam Sprint',
      totalQuestions: questions.length,
      durationMinutes: totalTimeMins,
      createdAt: new Date().toISOString(),
      questions,
      isCompleted: false,
    };

    setActiveTest(newTest);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(totalTimeMins * 60);
    setIsTestSubmitted(false);
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;

    let correctCount = 0;
    let earnedMarks = 0;
    let totalMarks = 0;

    activeTest.questions.forEach((q) => {
      const uAns = userAnswers[q.id]?.trim().toLowerCase();
      const cAns = q.correctAnswer.trim().toLowerCase();
      totalMarks += q.marks;

      if (uAns && (uAns === cAns || cAns.includes(uAns) || uAns.includes(cAns))) {
        correctCount += 1;
        earnedMarks += q.marks;
      }
    });

    const scorePercentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

    const finishedTest: MockTest = {
      ...activeTest,
      isCompleted: true,
      score: scorePercentage,
      userAnswers,
    };

    setActiveTest(finishedTest);
    setIsTestSubmitted(true);
    addCompletedTest(finishedTest);

    if (scorePercentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#22c55e', '#fbbf24'],
      });
      showToast(`🏆 Excellent Performance! You scored ${scorePercentage}%!`, 'success');
    } else {
      showToast(`Test submitted! You scored ${scorePercentage}%. Review step solutions below.`, 'info');
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // PYQs Filtered
  const filteredPYQs = pyqBank.filter((q) => {
    const matchSubject = pyqSubject === 'all' || q.subject.toLowerCase() === pyqSubject.toLowerCase();
    const matchSearch =
      q.text.toLowerCase().includes(pyqSearch.toLowerCase()) ||
      (q.pyqSource && q.pyqSource.toLowerCase().includes(pyqSearch.toLowerCase())) ||
      (q.chapter && q.chapter.toLowerCase().includes(pyqSearch.toLowerCase()));
    return matchSubject && matchSearch;
  });

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              Tests, Mocks & PYQ Bank
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Simulate CBSE Board marking, JEE difficulty spikes, or practice verified PYQs.
          </p>
        </div>

        {/* Sub-tab pills */}
        {!activeTest && (
          <div className="flex items-center gap-1.5 p-1 bg-[#131620] rounded-xl border border-[#232938]">
            <button
              onClick={() => setActiveSubTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'create'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              ⚡ Create Custom Mock
            </button>
            <button
              onClick={() => setActiveSubTab('pyqs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'pyqs'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              📚 PYQ Bank ({pyqBank.length})
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'history'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              📊 Test History ({completedTests.length})
            </button>
          </div>
        )}
      </div>

      {/* 2. Active Test Runner Interface (When a test is launched) */}
      {activeTest ? (
        <div className="space-y-5">
          {/* Test Header with Timer & Progress */}
          <div className="p-4 rounded-2xl bg-[#11141c] border border-[#232938] flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                  {activeTest.subject}
                </span>
                <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                  {activeTest.title}
                </h3>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Question {currentQuestionIndex + 1} of {activeTest.totalQuestions}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {!isTestSubmitted ? (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 font-mono font-bold text-sm text-orange-400">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>{formatSeconds(timeLeft)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 font-mono font-bold text-sm text-emerald-400">
                  <Award className="w-4 h-4" />
                  <span>Score: {activeTest.score}%</span>
                </div>
              )}

              {!isTestSubmitted ? (
                <button
                  onClick={handleSubmitTest}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all active:scale-95"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTest(null);
                    setIsTestSubmitted(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow transition-all"
                >
                  Back to Tests
                </button>
              )}
            </div>
          </div>

          {/* Test Questions Container */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left 3 Cols: Active Question & Solution */}
            <div className="lg:col-span-3 rounded-2xl bg-[#11141c] border border-[#232938] p-6 space-y-6 shadow-xl">
              {(() => {
                const currentQ = activeTest.questions[currentQuestionIndex];
                if (!currentQ) return null;

                const currentAnswer = userAnswers[currentQ.id] || '';
                const isCorrect =
                  isTestSubmitted &&
                  currentAnswer.toLowerCase().trim() ===
                    currentQ.correctAnswer.toLowerCase().trim();

                return (
                  <div className="space-y-6">
                    {/* Question Header & Marks */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#1e2330]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                          Q{currentQuestionIndex + 1}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Type: {currentQ.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentQ.pyqSource && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                            {currentQ.pyqSource}
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-gray-300">
                          {currentQ.marks} Marks
                        </span>
                      </div>
                    </div>

                    {/* Question Body */}
                    <div className="text-sm sm:text-base text-gray-100 font-medium leading-relaxed">
                      {currentQ.text}
                    </div>

                    {/* Answer Options (MCQs / Assertion) */}
                    {currentQ.options && currentQ.options.length > 0 ? (
                      <div className="space-y-2.5">
                        {currentQ.options.map((opt, oIdx) => {
                          const isSelected = currentAnswer === opt;
                          const isTheCorrectOption =
                            isTestSubmitted && currentQ.correctAnswer === opt;

                          let btnStyle = 'bg-[#151924] border-[#242b3c] text-gray-300 hover:bg-[#181d2c]';
                          if (isSelected) {
                            btnStyle = 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold';
                          }
                          if (isTestSubmitted) {
                            if (isTheCorrectOption) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isSelected && !isTheCorrectOption) {
                              btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isTestSubmitted}
                              onClick={() =>
                                setUserAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))
                              }
                              className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isTestSubmitted && isTheCorrectOption && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                              {isTestSubmitted && isSelected && !isTheCorrectOption && (
                                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Numerical / Derivation Answer Input */
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-300">
                          Your Numerical Answer / Value (with SI units):
                        </label>
                        <input
                          type="text"
                          disabled={isTestSubmitted}
                          value={currentAnswer}
                          onChange={(e) =>
                            setUserAnswers((prev) => ({
                              ...prev,
                              [currentQ.id]: e.target.value,
                            }))
                          }
                          placeholder="e.g. 4.8 A, 20 Ω, 0.75 V"
                          className="w-full px-4 py-3 rounded-xl bg-[#151922] border border-[#262d3d] text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    )}

                    {/* Step-by-Step Solution & Marking Scheme (Revealed after submission) */}
                    {isTestSubmitted && (
                      <div className="pt-4 border-t border-[#1e2330] space-y-4 animate-in fade-in duration-200">
                        <div className="p-4 rounded-xl bg-[#151924] border border-[#252c3e] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                              Official Step-by-Step Solution
                            </span>
                            <span className="text-xs font-mono font-bold text-white">
                              Correct: {currentQ.correctAnswer}
                            </span>
                          </div>
                          <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-mono">
                            {currentQ.explanation}
                          </div>
                        </div>

                        {currentQ.examinerTrap && (
                          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Examiner Trap:</strong> {currentQ.examinerTrap}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Nav Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#1e2330]">
                      <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                        className="px-4 py-2 rounded-xl bg-[#181d29] hover:bg-[#202738] disabled:opacity-30 text-xs font-semibold text-gray-300 transition-colors"
                      >
                        ← Previous Question
                      </button>
                      <button
                        disabled={currentQuestionIndex === activeTest.questions.length - 1}
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-xs font-bold text-white transition-colors"
                      >
                        Next Question →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right 1 Col: Question Navigation Palette */}
            <div className="rounded-2xl bg-[#11141c] border border-[#232938] p-5 space-y-4">
              <div className="text-xs font-bold text-gray-300">Question Palette</div>
              <div className="grid grid-cols-4 gap-2">
                {activeTest.questions.map((q, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = Boolean(userAnswers[q.id]?.trim());

                  let btnColor = 'bg-[#151924] border-[#252c3c] text-gray-400';
                  if (isAnswered) {
                    btnColor = 'bg-orange-500/20 border-orange-500 text-orange-400 font-bold';
                  }
                  if (isCurrent) {
                    btnColor = 'ring-2 ring-white border-orange-500 font-bold text-white bg-orange-500';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`p-2.5 rounded-xl border text-xs font-mono text-center transition-all ${btnColor}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="pt-3 border-t border-[#1e2330] space-y-1.5 text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500" />
                  <span>Answered ({Object.keys(userAnswers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#151924] border border-[#252c3c]" />
                  <span>Unanswered ({activeTest.questions.length - Object.keys(userAnswers).length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Normal View: Generator, PYQs, and History */
        <div className="space-y-6">
          {activeSubTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Mock Generator Config */}
              <div className="lg:col-span-2 rounded-2xl bg-[#11141c] border border-[#232938] p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <h3 className="font-heading font-bold text-base text-white">
                    Generate Curated Mock Test
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Subject & Chapter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300">Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        {user.subjects.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300">Chapter / Topic</label>
                      <input
                        type="text"
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        placeholder="e.g. Current Electricity & Kirchhoff Rules"
                        className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Exam Style Emulator */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Exam Paper Style Emulator
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'CBSE 12th Board Standard', desc: 'NCERT focus, step marking, derivations' },
                        { id: 'JEE Main Pattern', desc: 'Tricky numericals, conceptual traps' },
                        { id: 'NEET Speed Mock', desc: 'Fast assertion-reason, direct facts' },
                        { id: 'State Board / Univ', desc: 'Long answer derivations & definitions' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setExamStyle(style.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            examStyle === style.id
                              ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-bold shadow-sm'
                              : 'bg-[#151924] border-[#252c3c] text-gray-300 hover:bg-[#181d2a]'
                          }`}
                        >
                          <div className="text-xs font-bold">{style.id}</div>
                          <div className="text-[10px] text-gray-400 font-normal">{style.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count & Difficulty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300">Question Count</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[3, 5, 10, 15].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setQuestionCount(cnt)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              questionCount === cnt
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-[#151924] border-[#252c3c] text-gray-400'
                            }`}
                          >
                            {cnt} Qs
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="easy">Easy (Foundational)</option>
                        <option value="medium">Medium (Board Standard)</option>
                        <option value="hard">Hard (JEE / Tricky Traps)</option>
                      </select>
                    </div>
                  </div>

                  {/* Launch CTA */}
                  <button
                    type="button"
                    onClick={handleGenerateTest}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Crafting Exam Questions...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Start {questionCount}-Question Timed Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right 1 Col: Quick Tips & Performance Summary */}
              <div className="rounded-2xl bg-[#11141c] border border-[#232938] p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h4 className="font-heading font-bold text-sm text-white">
                    Indian Exam Scoring Rules
                  </h4>
                </div>

                <div className="space-y-3 text-xs text-gray-300">
                  <div className="p-3 rounded-xl bg-[#151924] border border-[#242b3c] space-y-1">
                    <div className="font-bold text-orange-400">Step Marking Enforced:</div>
                    <p className="text-[11px] text-gray-400">
                      In Board style tests, you earn partial marks for stating formulas and conditions even if the final calculation has arithmetic slips.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#151924] border border-[#242b3c] space-y-1">
                    <div className="font-bold text-red-400">Negative Marking:</div>
                    <p className="text-[11px] text-gray-400">
                      JEE and NEET modes simulate -1 mark penalties for wrong guesses to train your accuracy filter.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: PYQ Bank */}
          {activeSubTab === 'pyqs' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#11141c] border border-[#232938]">
                <input
                  type="text"
                  value={pyqSearch}
                  onChange={(e) => setPyqSearch(e.target.value)}
                  placeholder="Filter PYQs by keyword (e.g. Lenz, Drift Velocity, Nernst)..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white placeholder-gray-500 focus:outline-none"
                />

                <div className="flex items-center gap-2">
                  <select
                    value={pyqSubject}
                    onChange={(e) => setPyqSubject(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none"
                  >
                    <option value="all">All Subjects</option>
                    {user.subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredPYQs.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-[#11141c] border border-[#232938] hover:border-orange-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 rounded-md border border-amber-500/30">
                          {q.pyqSource || 'CBSE 2023'}
                        </span>
                        <span className="text-xs font-bold text-gray-300">
                          {q.subject} • {q.chapter}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-orange-400">
                        {q.marks} Marks
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed">
                      {q.text}
                    </p>

                    <div className="p-3 rounded-xl bg-[#151924] border border-[#232a3a] space-y-1 text-xs">
                      <div className="text-orange-400 font-mono font-bold">
                        Correct Answer: {q.correctAnswer}
                      </div>
                      <div className="text-gray-300 font-mono text-[11px] whitespace-pre-wrap">
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab 3: History */}
          {activeSubTab === 'history' && (
            <div className="space-y-3">
              {completedTests.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-[#11141c] border border-[#232938] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded">
                        {t.subject}
                      </span>
                      <h4 className="text-xs font-bold text-white">{t.title}</h4>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString()} • {t.totalQuestions} Questions
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-mono font-bold text-emerald-400">
                      {t.score}%
                    </div>
                    <span className="text-[10px] text-gray-400">Score</span>
                  </div>
                </div>
              ))}

              {completedTests.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-xs">
                  No completed mock tests yet. Launch your first test from the Create tab!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
