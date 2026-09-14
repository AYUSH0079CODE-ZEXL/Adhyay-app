import React, { useState } from 'react';
import {
  Timer,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Flame,
  AlertCircle,
  Play,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudySprintPlan } from '../types';
import { apiUrl } from '../lib/api';


export const StudySprintModal: React.FC = () => {
  const { isSprintOpen, setIsSprintOpen, user, logStudyTime, addXP, showToast } = useApp();

  const [duration, setDuration] = useState<number>(30);
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0] || 'Physics');
  const [topic, setTopic] = useState('Current Electricity & Circuits');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudySprintPlan | null>(null);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isExamTomorrowMode, setIsExamTomorrowMode] = useState(false);

  if (!isSprintOpen) return null;

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/gemini/study-planner'), {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: isExamTomorrowMode ? 'exam_tomorrow' : 'sprint',
          durationMinutes: isExamTomorrowMode ? 60 : duration,
          subject: selectedSubject,
          topic,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
        setActiveStage(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSprint = () => {
    logStudyTime(plan?.durationMinutes || duration);
    addXP(80, `Completed ${duration}m High-Yield Study Sprint`);
    showToast(`🎉 Sprint Complete! Logged ${duration} minutes of high-yield study.`, 'success');
    setIsSprintOpen(false);
    setPlan(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#11141c] border border-[#232938] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2330] bg-[#141720]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base text-white">
                  {isExamTomorrowMode ? '⚡ Night-Before-Exam Mode' : '⏱️ “I Have 30 Minutes” Study Sprint'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded-md">
                  HIGH YIELD
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Zero fluff. Scientifically budgeted study sprints for maximum retention.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSprintOpen(false);
              setPlan(null);
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c2230]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!plan ? (
            <div className="space-y-4">
              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#141822] rounded-xl border border-[#232a3a]">
                <button
                  type="button"
                  onClick={() => setIsExamTomorrowMode(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    !isExamTomorrowMode
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  ⏱️ Quick Study Sprint (5m - 2h)
                </button>
                <button
                  type="button"
                  onClick={() => setIsExamTomorrowMode(true)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    isExamTomorrowMode
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  🔥 Exam Tomorrow / Emergency
                </button>
              </div>

              {/* Time Selection */}
              {!isExamTomorrowMode && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300">How much time do you have?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 15, 30, 60, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDuration(mins)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                          duration === mins
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-sm'
                            : 'bg-[#151924] border-[#252c3c] text-gray-400 hover:text-gray-200 hover:bg-[#1a202e]'
                        }`}
                      >
                        {mins < 60 ? `${mins} mins` : `${mins / 60} hour${mins > 60 ? 's' : ''}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject & Topic Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {user.subjects.map((sub) => (
                      <option key={sub} value={sub} className="bg-[#11141c]">
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Topic / Chapter</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Current Electricity & Circuits"
                    className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Breakdown Preview */}
              <div className="p-4 rounded-xl bg-[#151924] border border-[#232a3a] space-y-2 text-xs">
                <div className="font-bold text-gray-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span>How Abhyas AI will structure your {isExamTomorrowMode ? 'Emergency Prep' : `${duration} minutes`}:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-[#1a1f2c] border border-[#283144]">
                    <div className="text-[10px] text-orange-400 font-bold uppercase">Stage 1</div>
                    <div className="font-semibold text-gray-200">Core Concepts</div>
                    <div className="text-[10px] text-gray-400">Formula & laws</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1a1f2c] border border-[#283144]">
                    <div className="text-[10px] text-orange-400 font-bold uppercase">Stage 2</div>
                    <div className="font-semibold text-gray-200">High-Yield PYQs</div>
                    <div className="text-[10px] text-gray-400">Repeated patterns</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1a1f2c] border border-[#283144]">
                    <div className="text-[10px] text-orange-400 font-bold uppercase">Stage 3</div>
                    <div className="font-semibold text-gray-200">Mistakes & Recall</div>
                    <div className="text-[10px] text-gray-400">Avoid lost marks</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1a1f2c] border border-[#283144]">
                    <div className="text-[10px] text-orange-400 font-bold uppercase">Stage 4</div>
                    <div className="font-semibold text-gray-200">Rapid Test</div>
                    <div className="text-[10px] text-gray-400">3-min self check</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-orange-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Generating High-Yield Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start {isExamTomorrowMode ? 'Exam Tomorrow Sprint' : `${duration}-Minute Sprint`}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Active Sprint Roadmap View */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <div>
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                    Active Sprint: {plan.subject}
                  </div>
                  <div className="text-sm font-bold text-white">{plan.topic}</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white rounded-lg text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{plan.durationMinutes} mins total</span>
                </div>
              </div>

              {/* Stages Accordion / Steps */}
              <div className="space-y-2.5">
                {plan.stages.map((stage) => {
                  const isCurrent = activeStage === stage.stageNumber;
                  const isDone = activeStage > stage.stageNumber;

                  return (
                    <div
                      key={stage.stageNumber}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-[#181d29] border-orange-500 shadow-md ring-1 ring-orange-500/30'
                          : isDone
                          ? 'bg-[#141822] border-emerald-500/30 opacity-80'
                          : 'bg-[#141822] border-[#232a3a] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                ? 'bg-orange-500 text-white'
                                : 'bg-[#222938] text-gray-400'
                            }`}
                          >
                            {isDone ? '✓' : stage.stageNumber}
                          </span>
                          <span className="font-heading font-bold text-xs text-white">
                            {stage.title}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#1e2434] text-orange-400 rounded">
                          {stage.duration}
                        </span>
                      </div>

                      <p className="text-xs text-gray-300 mb-2.5 leading-relaxed">{stage.content}</p>

                      <div className="space-y-1 bg-[#10131a] p-2.5 rounded-lg border border-[#212838]">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Key Focus Checklist:
                        </div>
                        {stage.bulletPoints.map((bp, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                            <span>{bp}</span>
                          </div>
                        ))}
                      </div>

                      {isCurrent && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (activeStage < plan.stages.length) {
                                setActiveStage(activeStage + 1);
                                addXP(20, `Completed Sprint Stage ${activeStage}`);
                              } else {
                                handleFinishSprint();
                              }
                            }}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow"
                          >
                            <span>
                              {activeStage < plan.stages.length ? 'Complete Stage & Next' : 'Finish Sprint & Claim XP'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
