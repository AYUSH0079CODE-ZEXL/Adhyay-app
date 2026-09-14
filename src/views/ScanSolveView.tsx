import React, { useState, useRef } from 'react';
import {
  ScanLine,
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Copy,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SolvedQuestionResponse } from '../types';

export const ScanSolveView: React.FC = () => {
  const { user, addXP, showToast } = useApp();

  const [questionText, setQuestionText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0] || 'Physics');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<SolvedQuestionResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!questionText.trim() && !imagePreview) {
      showToast('Please upload a photo or type a question', 'warning');
      return;
    }

    setLoading(true);
    setSolution(null);

    try {
      const res = await fetch('/api/gemini/scan-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText,
          imageData: imagePreview,
          subject: selectedSubject,
          academicLevel: user.classGrade || 'Class 12',
        }),
      });

      const data = await res.json();
      if (data.solution) {
        setSolution(data.solution);
        addXP(35, 'Solved question with AI Step-Marking Scheme');
        showToast('Question solved with marking scheme breakdown!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not solve question. Please check input.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'A wire of resistance 10 Ω is stretched to double its original length. What will be its new resistance and resistivity?',
    'Calculate the EMF of the cell at 298 K for: Mg(s) | Mg2+(0.1 M) || Cu2+(0.01 M) | Cu(s). Given E°(Mg2+/Mg) = -2.37 V, E°(Cu2+/Cu) = +0.34 V.',
    'State Biot-Savart law in vector form and derive the magnetic field at the centre of a circular coil carrying current I.',
  ];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <ScanLine className="w-4 h-4" />
            </div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              Scan & Solve with Board Marking Scheme
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Capture textbook problems, handwritten numericals, or PYQs. Get exact step-by-step scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
          >
            {user.subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl bg-[#11141c] border border-[#232938] p-5 space-y-4 shadow-xl">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Text Area & Camera Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300">
            Paste / Type Question or Upload Photo
          </label>
          <textarea
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your question or numerical here, or snap a photo of your book..."
            className="w-full p-3.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 leading-relaxed"
          />
        </div>

        {/* Image Preview if available */}
        {imagePreview && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a25] border border-[#262c3c]">
            <div className="flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Question preview"
                className="w-16 h-16 rounded-lg object-cover ring-1 ring-orange-500/30"
              />
              <div>
                <span className="text-xs font-bold text-white">Photo Question Attached</span>
                <p className="text-[11px] text-gray-400">AI will scan and extract mathematical symbols</p>
              </div>
            </div>
            <button
              onClick={() => setImagePreview(null)}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
            >
              Remove
            </button>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181d29] hover:bg-[#202738] text-gray-200 text-xs font-semibold border border-[#2b3448] transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-orange-400" />
              <span>Camera Snap</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181d29] hover:bg-[#202738] text-gray-200 text-xs font-semibold border border-[#2b3448] transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-orange-400" />
              <span>Upload Photo</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSolve}
            disabled={(!questionText.trim() && !imagePreview) || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Solving with Marking Scheme...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Solve & Show Step Marking</span>
              </>
            )}
          </button>
        </div>

        {/* Sample Question Suggestions */}
        <div className="pt-3 border-t border-[#1e2330] space-y-1.5">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Try a High-Yield Sample Question:
          </div>
          <div className="space-y-1">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setQuestionText(q)}
                className="w-full text-left text-[11px] text-gray-400 hover:text-orange-400 hover:bg-[#161a25] p-2 rounded-lg transition-colors truncate"
              >
                • {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Display Card */}
      {solution && (
        <div className="rounded-2xl bg-[#11141c] border border-[#232938] overflow-hidden shadow-2xl space-y-5 p-6 animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1e2330]">
            <div className="space-y-1">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                Official Step-Marking Breakdown
              </span>
              <h3 className="font-heading font-bold text-base text-white">
                Step-by-Step Examiner Solution
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">Total Weightage</span>
              <span className="text-xs font-mono font-bold text-orange-400">
                {solution.stepMarkingBreakdown.length} Marks
              </span>
            </div>
          </div>

          {/* Core Concept & Formula Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#151924] border border-[#242b3c] space-y-1">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Core Concept
              </div>
              <div className="text-xs font-semibold text-white">{solution.concept}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#151924] border border-[#242b3c] space-y-1">
              <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                Primary Formula Applied
              </div>
              <div className="text-xs font-mono font-bold text-orange-400">{solution.formulaUsed}</div>
            </div>
          </div>

          {/* Step-by-Step Marking Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-300">
              Board Marking Scheme Worksteps:
            </div>
            <div className="space-y-2.5">
              {solution.stepMarkingBreakdown.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl bg-[#161a25] border border-[#262c3c] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold">
                        {step.stepNumber}
                      </span>
                      <span className="text-xs font-bold text-gray-200">{step.description}</span>
                    </div>
                    <div className="text-xs text-gray-300 font-mono pl-7 whitespace-pre-wrap">
                      {step.working}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded whitespace-nowrap">
                    {step.marksAwarded}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Final Answer Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                Final Result
              </span>
              <div className="font-mono font-bold text-sm sm:text-base text-white">
                {solution.finalAnswer}
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>

          {/* Common Mistake Warning */}
          {solution.commonMistakeWarning && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Examiner Warning: Common Mistake to Avoid</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{solution.commonMistakeWarning}</p>
            </div>
          )}

          {/* Similar Practice Question */}
          {solution.similarPracticeQuestion && (
            <div className="p-4 rounded-xl bg-[#141822] border border-[#222838] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Similar Practice Question</span>
                </div>
                <button
                  onClick={() => setQuestionText(solution.similarPracticeQuestion!.text)}
                  className="text-[11px] font-bold text-orange-400 hover:text-orange-300"
                >
                  Load Question →
                </button>
              </div>
              <p className="text-xs text-gray-300">{solution.similarPracticeQuestion.text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
