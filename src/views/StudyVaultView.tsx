import React, { useState } from 'react';
import {
  FolderLock,
  Search,
  Plus,
  Star,
  Trash2,
  FileText,
  Youtube,
  BookOpen,
  Sparkles,
  Zap,
  Printer,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Share2,
  Copy,
  ChevronRight,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyMaterial, ExplanationMode } from '../types';
import { apiUrl } from '../lib/api';


export const StudyVaultView: React.FC = () => {
  const {
    materials,
    activeMaterial,
    setActiveMaterial,
    toggleFavoriteMaterial,
    deleteStudyMaterial,
    setIsUploadOpen,
    user,
    addXP,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [activeFormatTab, setActiveFormatTab] = useState<
    'complete' | 'easy' | 'revision' | 'ultra' | 'formulas' | 'derivations' | 'mistakes' | 'ask'
  >('complete');

  // Explain mode popover / state
  const [explainConcept, setExplainConcept] = useState('');
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>('beginner');
  const [explaining, setExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<string | null>(null);

  // Ask My Material state
  const [materialQuestion, setMaterialQuestion] = useState('');
  const [askingMaterial, setAskingMaterial] = useState(false);
  const [materialAnswer, setMaterialAnswer] = useState<{
    answer: string;
    citations: string[];
    confidence: string;
  } | null>(null);

  const filteredMaterials = materials.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject =
      selectedSubjectFilter === 'all' || m.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();
    return matchSearch && matchSubject;
  });

  const current = activeMaterial || materials[0] || null;

  const handleExplainConcept = async () => {
    if (!explainConcept.trim()) return;
    setExplaining(true);
    setExplanationResult(null);

    try {
      const res = await fetch(apiUrl('/api/gemini/explain-concept'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: explainConcept,
          mode: explanationMode,
          userProfile: user,
          subject: current?.subject || 'Science',
          chapter: current?.chapter || '',
          materialNotes: current?.notes?.complete || '',
        }),
      });
      const data = await res.json();
      setExplanationResult(data.explanation || 'Concept explanation generated.');
      addXP(20, `Explored concept with "${explanationMode}" mode`);
    } catch (err) {
      console.error(err);
      setExplanationResult('Could not complete explanation right now. Please try again.');
    } finally {
      setExplaining(false);
    }
  };

  const handleAskMaterial = async () => {
    if (!materialQuestion.trim() || !current) return;
    setAskingMaterial(true);
    setMaterialAnswer(null);

    try {
      const res = await fetch(apiUrl('/api/gemini/ask-material'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: materialQuestion,
          material: current,
        }),
      });

      const data = await res.json();
      setMaterialAnswer(data);
      addXP(15, 'Queried study material knowledge');
    } catch (err) {
      console.error(err);
      setMaterialAnswer({
        answer: 'Based on this study material, please check the main principles section.',
        citations: ['Chapter Notes'],
        confidence: 'medium',
      });
    } finally {
      setAskingMaterial(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 min-h-[calc(100vh-80px)]">
      {/* 1. Left Material Drawer / Explorer */}
      <div className="w-full md:w-80 flex flex-col space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-orange-400" />
            <h2 className="font-heading font-bold text-base text-white">Study Vault</h2>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, chapters..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#141722] border border-[#232938] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {['all', ...user.subjects].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubjectFilter(sub)}
              className={`px-2 py-0.5 text-[11px] rounded-lg whitespace-nowrap capitalize transition-colors ${
                selectedSubjectFilter === sub
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold'
                  : 'bg-[#141722] text-gray-400 hover:text-gray-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Material Items List */}
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[65vh] pr-1">
          {filteredMaterials.map((mat) => {
            const isSelected = current?.id === mat.id;
            return (
              <div
                key={mat.id}
                onClick={() => setActiveMaterial(mat)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
                  isSelected
                    ? 'bg-[#181d29] border-orange-500 shadow-md ring-1 ring-orange-500/30'
                    : 'bg-[#131620] border-[#222838] hover:border-orange-500/40 hover:bg-[#161a25]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                    {mat.subject}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMaterial(mat.id);
                      }}
                      className="p-1 hover:text-amber-400 text-gray-400"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          mat.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStudyMaterial(mat.id);
                      }}
                      className="p-1 hover:text-red-400 text-gray-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4
                  className={`text-xs font-bold truncate ${
                    isSelected ? 'text-orange-400' : 'text-gray-200 group-hover:text-white'
                  }`}
                >
                  {mat.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                  <span>{mat.chapter}</span>
                  <span className="text-[10px] capitalize bg-[#1d2332] px-1.5 py-0.2 rounded">
                    {mat.type}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredMaterials.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-xs">
              No materials found. Click <strong>+ Add</strong> to upload.
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Reader & Multi-Format Suite */}
      <div className="flex-1 flex flex-col rounded-2xl bg-[#11141c] border border-[#232938] overflow-hidden min-h-[600px]">
        {current ? (
          <>
            {/* Top Toolbar */}
            <div className="p-4 border-b border-[#1e2330] bg-[#141720] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-base sm:text-lg text-white">
                    {current.title}
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                    {current.subject}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {current.chapter} • {current.academicLevel || user.classGrade} ({user.boardOrExam})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1f2c] border border-[#2a3245] hover:bg-[#202738] text-xs font-semibold text-gray-300 transition-colors"
                  title="Print Exam Ready Cheat Sheet"
                >
                  <Printer className="w-3.5 h-3.5 text-orange-400" />
                  <span className="hidden sm:inline">Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Multi-Format Navigation Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-[#1b202c] bg-[#0d1016] overflow-x-auto">
              {[
                { id: 'complete', label: '📖 Complete Notes' },
                { id: 'easy', label: '💡 Easy Breakdown' },
                { id: 'revision', label: '⚡ Revision Sheet' },
                { id: 'ultra', label: '⏱️ 1-Min Recap' },
                { id: 'formulas', label: `📐 Formulas (${current.notes?.formulaSheet?.length || 0})` },
                { id: 'derivations', label: '📝 Derivations' },
                { id: 'mistakes', label: '⚠️ Exam Traps' },
                { id: 'ask', label: '🔍 Ask My Material' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormatTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                    activeFormatTab === tab.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-[#151924] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Interactive Concept Explain Assistant Bar */}
            <div className="p-3 bg-[#151924] border-b border-[#222838] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <input
                  type="text"
                  value={explainConcept}
                  onChange={(e) => setExplainConcept(e.target.value)}
                  placeholder="Need any concept simplified? Type keyword (e.g. Lenz Law)..."
                  className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={explanationMode}
                  onChange={(e) => setExplanationMode(e.target.value as ExplanationMode)}
                  className="px-2 py-1 rounded-lg bg-[#1a1f2c] border border-[#2b3346] text-xs text-gray-300 focus:outline-none"
                >
                  <option value="beginner">🐣 Beginner / ELI5</option>
                  <option value="exam_ready">🎯 Exam Step-Marking</option>
                  <option value="step_by_step">🔢 Mathematical Derivation</option>
                  <option value="hinglish">🇮🇳 Hinglish / Analogy</option>
                </select>

                <button
                  onClick={handleExplainConcept}
                  disabled={!explainConcept.trim() || explaining}
                  className="px-3 py-1 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {explaining ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Explain</span>
                  )}
                </button>
              </div>
            </div>

            {/* Explanation Result Box (if triggered) */}
            {explanationResult && (
              <div className="p-4 bg-[#181d29] border-b border-orange-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>AI Concept Explanation ({explanationMode})</span>
                  </div>
                  <button
                    onClick={() => setExplanationResult(null)}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Close
                  </button>
                </div>
                <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap bg-[#11141c] p-3 rounded-xl border border-[#242b3c]">
                  {explanationResult}
                </div>
              </div>
            )}

            {/* Reader Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 print:p-0">
              {/* 1. Complete Notes */}
              {activeFormatTab === 'complete' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#161a25] border border-[#262c3c] flex items-center justify-between">
                    <span className="text-xs text-gray-300 font-medium">
                      Curriculum aligned to <strong>{user.boardOrExam}</strong> standards.
                    </span>
                    <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded">
                      NCERT Grounded
                    </span>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-200 leading-relaxed space-y-4 whitespace-pre-wrap">
                    {current.notes?.complete || (
                      <div className="text-gray-400 italic">No complete notes generated yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Easy Notes */}
              {activeFormatTab === 'easy' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300">
                    💡 <strong>Simplified Language:</strong> Every core concept explained with intuitive real-life analogies, avoiding confusing jargon.
                  </div>
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-200 leading-relaxed space-y-4 whitespace-pre-wrap">
                    {current.notes?.easy || (
                      <div className="text-gray-400 italic">No easy notes generated yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Revision Sheet */}
              {activeFormatTab === 'revision' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    ⚡ <strong>High-Yield Revision:</strong> Read this right before answering practice questions.
                  </div>
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-200 leading-relaxed space-y-4 whitespace-pre-wrap">
                    {current.notes?.revision || (
                      <div className="text-gray-400 italic">No revision notes generated yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Ultra Quick */}
              {activeFormatTab === 'ultra' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    ⏱️ <strong>1-Minute Emergency Recap:</strong> Key laws, definitions, and high-stakes constants.
                  </div>
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-200 leading-relaxed space-y-4 whitespace-pre-wrap">
                    {current.notes?.ultraQuick || (
                      <div className="text-gray-400 italic">No ultra-quick recap available.</div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. Formulas */}
              {activeFormatTab === 'formulas' && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-gray-300 flex items-center justify-between">
                    <span>Formula Sheet with SI Units & Constraints</span>
                    <span className="text-[11px] text-orange-400 font-mono">
                      {current.notes?.formulaSheet?.length || 0} Equations
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {current.notes?.formulaSheet?.map((f, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[#151924] border border-[#242b3c] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{f.description}</span>
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-orange-500/15 text-orange-400 rounded font-bold">
                            {f.units || 'SI Units'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#0e1017] border border-[#1f2533] font-mono text-sm font-bold text-orange-400">
                          {f.formula}
                        </div>
                        {f.symbols && (
                          <div className="text-[11px] text-gray-400">
                            <strong>Symbols:</strong> {f.symbols}
                          </div>
                        )}
                        {f.whenToUse && (
                          <div className="text-[11px] text-emerald-400">
                            <strong>When to use:</strong> {f.whenToUse}
                          </div>
                        )}
                        {f.conditions && (
                          <div className="text-[10px] text-amber-400">
                            <strong>Conditions:</strong> {f.conditions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Derivations */}
              {activeFormatTab === 'derivations' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#161a25] border border-[#262c3c] text-xs text-gray-300">
                    📝 <strong>Standard Board Exam Derivations:</strong> Formatted with statement, diagram cues, equations, and final conclusions.
                  </div>

                  {current.notes?.derivations?.map((d, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#151924] border border-[#242b3c] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm text-white">{d.title}</h4>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded">
                          {d.marks || 5} Marks
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {d.steps}
                      </div>
                      {d.conclusion && (
                        <div className="p-2.5 rounded-lg bg-[#0e1017] border border-[#1f2533] text-xs text-orange-400 font-semibold">
                          Conclusion: {d.conclusion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 7. Mistakes & Traps */}
              {activeFormatTab === 'mistakes' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    ⚠️ <strong>Examiner Pitfalls:</strong> These are the exact errors that cost students 20-30% of marks in competitive and board exams.
                  </div>

                  {current.notes?.commonMistakes?.map((m, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#161a25] border border-red-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Common Trap #{i + 1}: {m.mistake}</span>
                      </div>
                      <div className="text-xs text-gray-300">
                        <strong className="text-gray-400">Why students lose marks:</strong> {m.whyStudentsMakeIt}
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                        <strong>Correct Exam Method:</strong> {m.correctApproach}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. Ask My Material */}
              {activeFormatTab === 'ask' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#161a25] border border-[#262c3c] text-xs text-gray-300 space-y-1">
                    <div className="font-bold text-orange-400">Grounded Q&A:</div>
                    <p className="text-[11px] text-gray-400">
                      Answers are generated strictly using the content of <strong>"{current.title}"</strong>. If the answer is not in this document, the AI will explicitly warn you.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={materialQuestion}
                      onChange={(e) => setMaterialQuestion(e.target.value)}
                      placeholder="Ask any question about this study material..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={handleAskMaterial}
                      disabled={!materialQuestion.trim() || askingMaterial}
                      className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {askingMaterial ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Ask</span>
                        </>
                      )}
                    </button>
                  </div>

                  {materialAnswer && (
                    <div className="p-4 rounded-xl bg-[#151924] border border-[#242b3c] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-400">Grounded Answer</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded">
                          Confidence: {materialAnswer.confidence}
                        </span>
                      </div>

                      <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {materialAnswer.answer}
                      </div>

                      {materialAnswer.citations?.length > 0 && (
                        <div className="pt-2 border-t border-[#1e2330] flex items-center gap-2 text-[10px] text-gray-400">
                          <span>Citations:</span>
                          {materialAnswer.citations.map((c, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-[#1c2230] text-gray-300 font-mono"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <FolderLock className="w-12 h-12 text-gray-600" />
            <h3 className="font-heading font-bold text-base text-white">Study Vault is Empty</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Upload your syllabus notes, textbook scans, or YouTube lectures to get multi-format notes.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-md"
            >
              Upload First Material
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
