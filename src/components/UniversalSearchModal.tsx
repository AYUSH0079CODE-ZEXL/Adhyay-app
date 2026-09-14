import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileText,
  Youtube,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UniversalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    materials,
    setActiveMaterial,
    setActiveTab,
    pyqBank,
    doubts,
  } = useApp();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'notes' | 'formulas' | 'pyqs' | 'videos' | 'doubts'
  >('all');

  // Keyboard shortcut listener for CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  // Filtered materials
  const matchedMaterials = materials.filter((m) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.chapter.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Filtered formulas
  const matchedFormulas = materials.flatMap((m) =>
    (m.notes?.formulaSheet || []).filter((f) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        f.formula.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q)
      );
    }).map((f) => ({ ...f, parentMaterial: m }))
  );

  // Filtered PYQs
  const matchedPYQs = pyqBank.filter((q) => {
    if (!query) return true;
    const qLower = query.toLowerCase();
    return (
      q.text.toLowerCase().includes(qLower) ||
      (q.pyqSource && q.pyqSource.toLowerCase().includes(qLower)) ||
      (q.chapter && q.chapter.toLowerCase().includes(qLower)) ||
      (q.subject && q.subject.toLowerCase().includes(qLower))
    );
  });

  // Filtered Doubts
  const matchedDoubts = doubts.filter((d) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#11141c] border border-[#232938] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1e2330] bg-[#141720]">
          <Search className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search across Study Vault, Notes, Formulas, PYQs, Videos, Doubts..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-2 py-1 text-[11px] text-gray-400 bg-[#1c2230] rounded border border-[#2c3444] hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#1b202c] overflow-x-auto bg-[#0f1218]">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'notes', label: `Study Notes (${matchedMaterials.length})` },
            { id: 'formulas', label: `Formulas (${matchedFormulas.length})` },
            { id: 'pyqs', label: `PYQ Bank (${matchedPYQs.length})` },
            { id: 'doubts', label: `Doubts (${matchedDoubts.length})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id as any)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterType === pill.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#171b26] text-gray-400 hover:text-gray-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Notes & Materials */}
          {(filterType === 'all' || filterType === 'notes') && matchedMaterials.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Study Vault Materials
              </div>
              <div className="space-y-1.5">
                {matchedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => {
                      setActiveMaterial(mat);
                      setActiveTab('vault');
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#151924] border border-[#232938] hover:border-orange-500/50 hover:bg-[#191e2b] cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                        {mat.type === 'youtube' ? (
                          <Youtube className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                          {mat.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <span>{mat.subject}</span>
                          <span>•</span>
                          <span>{mat.chapter}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas */}
          {(filterType === 'all' || filterType === 'formulas') && matchedFormulas.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Formulas & Equations
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedFormulas.slice(0, 6).map((f, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveMaterial(f.parentMaterial);
                      setActiveTab('vault');
                      setIsSearchOpen(false);
                    }}
                    className="p-3 rounded-xl bg-[#151924] border border-[#232938] hover:border-amber-500/50 cursor-pointer space-y-1 transition-all"
                  >
                    <div className="text-xs font-mono font-bold text-orange-400">{f.formula}</div>
                    <div className="text-[11px] text-gray-300 line-clamp-1">{f.description}</div>
                    <div className="text-[10px] text-gray-400 font-mono">Units: {f.units}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PYQs */}
          {(filterType === 'all' || filterType === 'pyqs') && matchedPYQs.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Previous Year Exam Questions
              </div>
              <div className="space-y-1.5">
                {matchedPYQs.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setActiveTab('tests');
                      setIsSearchOpen(false);
                    }}
                    className="p-3 rounded-xl bg-[#151924] border border-[#232938] hover:border-orange-500/50 cursor-pointer space-y-1 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                        {q.pyqSource}
                      </span>
                      <span className="text-[10px] text-gray-400 capitalize">{q.difficulty} • {q.marks} Marks</span>
                    </div>
                    <p className="text-xs text-gray-200 line-clamp-2">{q.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doubts */}
          {(filterType === 'all' || filterType === 'doubts') && matchedDoubts.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Community Doubts
              </div>
              <div className="space-y-1.5">
                {matchedDoubts.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setActiveTab('doubts');
                      setIsSearchOpen(false);
                    }}
                    className="p-3 rounded-xl bg-[#151924] border border-[#232938] hover:border-orange-500/50 cursor-pointer space-y-1 transition-all"
                  >
                    <div className="text-xs font-bold text-gray-200">{d.title}</div>
                    <div className="text-[11px] text-gray-400 line-clamp-1">{d.description}</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{d.subject}</span>
                      <span>•</span>
                      <span>{d.answers.length} answers</span>
                      {d.isResolved && (
                        <span className="text-emerald-400 font-bold">• Resolved</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {matchedMaterials.length === 0 &&
            matchedFormulas.length === 0 &&
            matchedPYQs.length === 0 &&
            matchedDoubts.length === 0 && (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Search className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-semibold">No matching academic records found</p>
                <p className="text-xs text-gray-500">
                  Try searching for a subject, chapter, formula, or concept name.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
