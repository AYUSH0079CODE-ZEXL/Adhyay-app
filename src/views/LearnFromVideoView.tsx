import React, { useState, useEffect, useRef } from 'react';
import {
  Youtube,
  Play,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  HelpCircle,
  Layers,
  FileText,
  AlertTriangle,
  RotateCcw,
  Send,
  Save,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ListOrdered,
  Sigma,
  Lightbulb,
  Award,
  Share2,
  Bookmark,
  Check,
  X,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyMaterial } from '../types';
import { apiUrl } from '../lib/api';


export const LearnFromVideoView: React.FC = () => {
  const { addStudyMaterial, showToast, addXP, setActiveTab } = useApp();

  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Study Pack state
  const [studyPack, setStudyPack] = useState<any | null>(null);
  const [activeTab, setActiveTabLocal] = useState<
    'notes' | 'formulas' | 'derivations' | 'mistakes' | 'questions' | 'flashcards' | 'test' | 'ask'
  >('notes');
  const [notesFormat, setNotesFormat] = useState<'complete' | 'easy' | 'revision' | 'ultraQuick'>('easy');

  // Flashcard interaction state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Mini-test interaction state
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  // Ask this video chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'tutor'; text: string }>>([
    {
      sender: 'tutor',
      text: 'Namaste! I am your AI Video Tutor for this lecture. Ask me to clarify any formula, explain a derivation in simpler words, or explain what was taught at any specific timestamp!',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // YouTube player reference
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Preset quick sample lectures
  const sampleLectures = [
    {
      title: 'Current Electricity & Drift Velocity (Class 12)',
      url: 'https://www.youtube.com/watch?v=kYJvB1h5W_s',
      subject: 'Physics',
    },
    {
      title: 'Chemical Bonding & Hybridization',
      url: 'https://www.youtube.com/watch?v=CGA8sRwqIFg',
      subject: 'Chemistry',
    },
    {
      title: 'Integration by Parts & High-Yield Tricks',
      url: 'https://www.youtube.com/watch?v=rAof9Ld5sOg',
      subject: 'Mathematics',
    },
  ];

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = (urlToAnalyze || videoUrl).trim();
    if (!targetUrl) {
      showToast('Please enter a YouTube lecture link.', 'warning');
      return;
    }

    // Check basic URL format
    const isYT = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/.test(targetUrl);
    if (!isYT && !targetUrl.startsWith('http')) {
      showToast('Please provide a valid educational video link.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setCurrentStage('Connecting to ADHYAY Video Understanding Engine...');

    try {
      // Initiate request to backend
      const res = await fetch(apiUrl('/api/video/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to start video lecture analysis');
      }

      const { analysisId } = data;

      // Real status polling
      let pollCount = 0;
      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await fetch(apiUrl(`/api/video/status/${analysisId}`));
          const statusData = await statusRes.json();


          if (statusData.success && statusData.analysis) {
            const status = statusData.analysis.status;

            if (status === 'ANALYZING') {
              setCurrentStage('Understanding video lecture, visuals & spoken topics...');
            } else if (status === 'EXTRACTING_CONTENT') {
              setCurrentStage('Extracting formulas, derivations & academic hierarchy...');
            } else if (status === 'GENERATING_NOTES') {
              setCurrentStage('Building multi-format notes & generating test questions...');
            } else if (status === 'COMPLETED') {
              clearInterval(pollInterval);
              setIsAnalyzing(false);
              setStudyPack(statusData.analysis);
              addXP(100, 'Analyzed Video Lecture with AI');
              showToast('Lecture Study Pack Ready!', 'success');
            } else if (status === 'FAILED') {
              clearInterval(pollInterval);
              setIsAnalyzing(false);
              setErrorMessage(
                statusData.analysis.errorMessage ||
                  "This video can't be accessed for analysis. Try a public YouTube lecture or upload the video file."
              );
            }
          }

          if (pollCount > 30) {
            clearInterval(pollInterval);
            setIsAnalyzing(false);
            setErrorMessage('Analysis timed out. Please verify your connection and try again.');
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 1500);
    } catch (err: any) {
      console.error('Video analyze error:', err);
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Failed to analyze lecture video');
    }
  };

  // Jump YouTube player to specific timestamp
  const handleSeek = (seconds: number) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }),
        '*'
      );
    }
    showToast(`Jumped to ${Math.floor(seconds / 60)}m ${seconds % 60}s`, 'info');
  };

  // Ask this video tutor
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await fetch(apiUrl('/api/video/chat'), {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          videoContext: studyPack,
          history: chatMessages,
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { sender: 'tutor', text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'tutor', text: 'I am reviewing the lecture notes. Could you ask in simpler terms?' },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'tutor', text: 'Connection issue while consulting video tutor. Please retry.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Save to Study Vault
  const handleSaveToVault = () => {
    if (!studyPack) return;

    const newMaterial: StudyMaterial = {
      id: `mat_${Date.now()}`,
      title: studyPack.title,
      type: 'youtube',
      subject: studyPack.detectedSubject || 'Physics',
      chapter: studyPack.detectedChapter || 'Lecture',
      topic: studyPack.detectedTopic || 'Lecture Notes',
      academicLevel: studyPack.estimatedAcademicLevel || 'Class 12',
      sourceUrl: studyPack.sourceUrl,
      summary: studyPack.overview || 'AI-generated study pack from video lecture.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [studyPack.detectedSubject || 'General', 'Video Lecture', 'AI Study Pack'],
      isFavorite: true,
      notes: studyPack.notes,
      flashcards: studyPack.flashcards,
      questions: studyPack.questions,
      videoChapters: studyPack.timestamps,
    };

    addStudyMaterial(newMaterial);
    showToast(`Saved "${studyPack.title}" to your Study Vault!`, 'success');
  };

  // Mini-test evaluation
  const handleAnswerSelect = (questionId: string, option: string) => {
    if (testSubmitted) return;
    setTestAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitMiniTest = () => {
    if (!studyPack?.miniTest?.questions) return;
    let score = 0;
    studyPack.miniTest.questions.forEach((q: any) => {
      if (testAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    setTestScore(score);
    setTestSubmitted(true);
    addXP(score * 15 + 40, `Completed ${studyPack.title} Mini-Test (${score}/${studyPack.miniTest.questions.length})`);
    showToast(`Test submitted! You scored ${score}/${studyPack.miniTest.questions.length}`, 'success');
  };

  // Extract video ID for iframe
  const ytId = studyPack?.youtubeId || (videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/) || [])[1];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Frictionless Video Understanding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Learn from Video
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Paste any lecture link. ADHYAY automatically extracts the academic syllabus, formulas, derivations, interactive timestamps, and creates your complete Study Pack.
        </p>
      </div>

      {/* Input Form: Simple, Zero-Friction */}
      {!studyPack && (
        <div className="p-5 sm:p-7 rounded-2xl bg-[#11141c] border border-[#212736] space-y-4 shadow-xl">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Paste YouTube Lecture Link
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#171b26] border border-[#2b3345] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                  disabled={isAnalyzing}
                />
              </div>
              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzing || !videoUrl.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-bold shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Video</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Lecture Chips */}
          <div className="pt-2 border-t border-[#1c2230] space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Or Try A Preset Indian Curriculum Lecture:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleLectures.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setVideoUrl(s.url);
                    handleAnalyze(s.url);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#181d28] border border-[#293245] text-xs text-gray-300 hover:text-orange-400 hover:border-orange-500/40 hover:bg-[#1e2433] transition-all flex items-center gap-1.5 text-left"
                >
                  <Play className="w-3 h-3 text-orange-400 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{s.title}</span>
                  <span className="text-[10px] text-gray-400 px-1 py-0.2 bg-[#12151e] rounded">
                    {s.subject}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Real Analysis Progress Stages */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-[#171b26] border border-orange-500/30 space-y-3 animate-pulse">
              <div className="flex items-center gap-2.5 text-orange-400 text-sm font-bold">
                <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
                <span>{currentStage}</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Connecting to Gemini Academic Model</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Identifying Teacher Curriculum & Board Level</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 font-medium">
                  <span className="w-3.5 h-3.5 border border-orange-400 border-t-transparent rounded-full animate-spin" />
                  <span>Structuring Multi-format Notes, MCQs & 10-Question Mini Test...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-red-200">Unable to analyze video</p>
                <p>{errorMessage}</p>
                <button
                  onClick={() => handleAnalyze()}
                  className="mt-1 inline-flex items-center gap-1 text-orange-400 hover:underline font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Retry Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPLETED STUDY PACK INTERFACE */}
      {/* ========================================================================= */}
      {studyPack && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Video Overview Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#11141c] border border-[#212736] space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                    {studyPack.detectedSubject || 'Physics'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#191e2b] border border-[#2a3347] text-gray-300 text-xs font-medium">
                    {studyPack.detectedChapter || 'Lecture Chapter'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#191e2b] border border-[#2a3347] text-gray-300 text-xs font-medium">
                    {studyPack.estimatedAcademicLevel || 'Class 12'}
                  </span>
                  {studyPack.isAiEstimated && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                      AI-Estimated
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {studyPack.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-3xl">
                  {studyPack.overview}
                </p>
              </div>

              {/* Action Buttons: Save & New Analysis */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleSaveToVault}
                  className="px-3.5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Vault</span>
                </button>
                <button
                  onClick={() => {
                    setStudyPack(null);
                    setVideoUrl('');
                  }}
                  className="px-3 py-2 rounded-xl bg-[#181d28] border border-[#2b3345] text-gray-300 text-xs font-semibold hover:text-white hover:bg-[#202736] transition-colors"
                >
                  New Video
                </button>
              </div>
            </div>

            {/* Embedded Player & Interactive Timestamps Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-[#1c2230]">
              {/* YouTube Video Player */}
              <div className="lg:col-span-7 bg-black rounded-xl overflow-hidden border border-[#212736] aspect-video relative">
                {ytId ? (
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1`}
                    title={studyPack.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center space-y-2">
                    <Youtube className="w-10 h-10 text-red-500" />
                    <p className="text-xs">Lecture media embedded. Use timestamps to follow the academic timeline.</p>
                  </div>
                )}
              </div>

              {/* Interactive Timestamp Navigator */}
              <div className="lg:col-span-5 bg-[#141822] rounded-xl border border-[#232938] p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#212736] mb-2.5">
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      Interactive Timestamps
                    </span>
                    <span className="text-[10px] text-gray-400">Click to jump video</span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {studyPack.timestamps?.map((ts: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleSeek(ts.seconds)}
                        className="w-full p-2 rounded-lg bg-[#181d28] hover:bg-orange-500/10 hover:border-orange-500/30 border border-transparent text-left transition-all group flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-gray-200 group-hover:text-orange-400 transition-colors block truncate">
                            {ts.title}
                          </span>
                          <span className="text-[10px] text-gray-400 line-clamp-1">
                            {ts.summary}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-[#10131a] text-[10px] font-mono font-bold text-orange-400 shrink-0">
                          {ts.timestamp}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#212736] text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Source: Lecture Stream</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Fully Grounded
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#1f2430]">
            {[
              { id: 'notes', label: 'AI Notes', icon: BookOpen },
              { id: 'formulas', label: 'Formulas & Definitions', icon: Sigma },
              { id: 'derivations', label: 'Derivations & Examples', icon: Lightbulb },
              { id: 'mistakes', label: 'Common Mistakes', icon: AlertTriangle },
              { id: 'questions', label: 'Practice Questions', icon: HelpCircle, count: studyPack.questions?.length },
              { id: 'flashcards', label: 'Flashcards', icon: Layers, count: studyPack.flashcards?.length },
              { id: 'test', label: '10-Q Mini Test', icon: Award },
              { id: 'ask', label: 'Ask This Video', icon: Volume2, badge: 'AI Tutor' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabLocal(tab.id as any)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#141822] border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#1c2230] text-gray-300 font-bold">
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-orange-500 text-white font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ================================================================= */}
          {/* TAB 1: NOTES (MULTI-FORMAT) */}
          {/* ================================================================= */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Note Format Selector */}
              <div className="flex items-center gap-2 bg-[#12151e] p-1.5 rounded-xl border border-[#212736] max-w-fit">
                {[
                  { id: 'easy', label: 'Easy (With Analogies)' },
                  { id: 'complete', label: 'Complete Academic' },
                  { id: 'revision', label: 'High-Yield Revision' },
                  { id: 'ultraQuick', label: '⚡ 1-Min Hallway' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setNotesFormat(fmt.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      notesFormat === fmt.id
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Note Content Box */}
              <div className="p-6 rounded-2xl bg-[#11141c] border border-[#212736] space-y-4">
                <div className="prose prose-invert max-w-none text-sm text-gray-200 leading-relaxed font-sans whitespace-pre-line">
                  {studyPack.notes?.[notesFormat] || studyPack.notes?.easy || 'Notes are being compiled.'}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: FORMULAS & DEFINITIONS */}
          {/* ================================================================= */}
          {activeTab === 'formulas' && (
            <div className="space-y-6">
              {/* Formula Sheet */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <Sigma className="w-4 h-4" /> Formula Sheet
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {studyPack.notes?.formulaSheet?.map((f: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#12151e] border border-[#212736] space-y-2 hover:border-orange-500/30 transition-colors"
                    >
                      <div className="px-2.5 py-1 rounded bg-[#181d28] border border-[#283244] font-mono font-bold text-orange-400 text-sm inline-block">
                        {f.formula}
                      </div>
                      <p className="text-xs font-semibold text-gray-200">{f.description}</p>
                      <div className="space-y-1 text-[11px] text-gray-400">
                        <p><strong className="text-gray-300">Symbols:</strong> {f.symbols}</p>
                        <p><strong className="text-gray-300">Units:</strong> {f.units}</p>
                        <p><strong className="text-gray-300">When to use:</strong> {f.whenToUse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Definitions */}
              <div className="space-y-3 pt-4 border-t border-[#1f2430]">
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-400" /> Core Academic Definitions
                </h3>
                <div className="space-y-2.5">
                  {studyPack.notes?.definitions?.map((d: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#12151e] border border-[#212736] space-y-1">
                      <span className="text-xs font-bold text-white">{d.term}</span>
                      <p className="text-xs text-gray-300">{d.definition}</p>
                      <span className="inline-block text-[10px] text-orange-400/90 font-medium">
                        ✦ Exam Relevance: {d.importance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: DERIVATIONS & EXAMPLES */}
          {/* ================================================================= */}
          {activeTab === 'derivations' && (
            <div className="space-y-6">
              {/* Derivations */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" /> Step-by-Step Mathematical Derivations
                </h3>
                {studyPack.notes?.derivations?.map((dev: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#11141c] border border-[#212736] space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      {dev.title}
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-gray-300 leading-relaxed font-mono pl-1">
                      {dev.steps?.map((st: string, idx: number) => (
                        <li key={idx} className="pl-1">
                          <span className="font-sans text-gray-200">{st}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300">
                      <strong>Key Derivation Takeaway:</strong> {dev.keyTakeaway}
                    </div>
                  </div>
                ))}
              </div>

              {/* Solved Examples */}
              <div className="space-y-3 pt-4 border-t border-[#1f2430]">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Solved Numericals & Examples
                </h3>
                <div className="space-y-3">
                  {studyPack.notes?.examples?.map((ex: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-[#11141c] border border-[#212736] space-y-2">
                      <p className="text-xs font-bold text-white">Problem: {ex.problem}</p>
                      <div className="p-3 rounded-lg bg-[#161a24] font-mono text-xs text-gray-200">
                        {ex.solution}
                      </div>
                      <p className="text-[11px] text-amber-400 font-semibold">
                        Exam Tip: {ex.examTip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: MISTAKES & TRAPS */}
          {/* ================================================================= */}
          {activeTab === 'mistakes' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Common Student Exam Mistakes & Pitfalls
                </h3>
                <div className="space-y-3">
                  {studyPack.notes?.commonMistakes?.map((m: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-[#141012] border border-red-500/25 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                        <X className="w-4 h-4 text-red-400" />
                        <span>Mistake: {m.mistake}</span>
                      </div>
                      <p className="text-xs text-gray-400 pl-6">
                        <strong className="text-gray-300">Why it's wrong:</strong> {m.whyWrong}
                      </p>
                      <p className="text-xs text-emerald-400 font-medium pl-6">
                        <strong className="text-emerald-300">Correct Board Method:</strong> {m.correctWay}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exceptions */}
              <div className="space-y-3 pt-4 border-t border-[#1f2430]">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Syllabus Exceptions & Boundary Conditions
                </h3>
                <div className="space-y-2.5">
                  {studyPack.notes?.exceptions?.map((exc: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#14151a] border border-[#262c3b] space-y-1">
                      <p className="text-xs font-bold text-gray-200">Standard Rule: {exc.rule}</p>
                      <p className="text-xs text-amber-400">Exception: {exc.exception}</p>
                      <p className="text-[11px] text-gray-400">Caution: {exc.examCaution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: PRACTICE QUESTIONS */}
          {/* ================================================================= */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Practice Questions from this Lecture ({studyPack.questions?.length || 0})
                </h3>
                <span className="text-[11px] text-gray-400">Generated directly from lecture content</span>
              </div>

              <div className="space-y-4">
                {studyPack.questions?.map((q: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#11141c] border border-[#212736] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase">
                          {q.type}
                        </span>
                        {q.isPyq && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                            PYQ: {q.pyqSource}
                          </span>
                        )}
                        {!q.isPyq && (
                          <span className="px-2 py-0.5 rounded bg-[#181d28] text-gray-400 text-[10px]">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-gray-400">{q.marks} Mark{q.marks > 1 ? 's' : ''}</span>
                    </div>

                    <p className="text-sm font-semibold text-white whitespace-pre-line">{q.text}</p>

                    {/* Options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isCorrect = opt === q.correctAnswer;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 font-medium'
                                  : 'bg-[#141720] border-[#222836] text-gray-300'
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && (
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    <div className="p-3 rounded-lg bg-[#161a24] text-xs text-gray-300 space-y-1">
                      <p><strong className="text-orange-400">Explanation:</strong> {q.explanation}</p>
                      {q.hints && q.hints.length > 0 && (
                        <p className="text-[11px] text-gray-400">💡 Hint: {q.hints[0]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: FLASHCARDS */}
          {/* ================================================================= */}
          {activeTab === 'flashcards' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Card {activeCardIndex + 1} of {studyPack.flashcards?.length || 0}
                </span>
                <span className="text-orange-400 font-semibold">Click card to flip</span>
              </div>

              {studyPack.flashcards && studyPack.flashcards.length > 0 && (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="min-h-[220px] p-6 rounded-2xl bg-[#141720] border border-orange-500/30 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-orange-500/60 transition-all select-none group"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="uppercase tracking-wider font-bold text-orange-400">
                      {isFlipped ? 'Answer / Explanation' : 'Concept / Question'}
                    </span>
                    <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
                  </div>

                  <div className="text-center py-4">
                    <p className="text-base sm:text-lg font-bold text-white whitespace-pre-line leading-relaxed">
                      {isFlipped
                        ? studyPack.flashcards[activeCardIndex].back
                        : studyPack.flashcards[activeCardIndex].front}
                    </p>
                  </div>

                  <div className="text-center text-[10px] text-gray-400">
                    {isFlipped ? 'Tap to see question again' : 'Tap to reveal answer'}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveCardIndex((prev) => Math.max(prev - 1, 0));
                  }}
                  disabled={activeCardIndex === 0}
                  className="px-4 py-2 rounded-xl bg-[#161a24] border border-[#2b3345] text-xs font-semibold text-gray-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      showToast('Marked as Needs Review', 'info');
                      setIsFlipped(false);
                      setActiveCardIndex((prev) => (prev + 1) % studyPack.flashcards.length);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold"
                  >
                    Needs Review
                  </button>
                  <button
                    onClick={() => {
                      addXP(10, 'Reviewed flashcard');
                      setIsFlipped(false);
                      setActiveCardIndex((prev) => (prev + 1) % studyPack.flashcards.length);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
                  >
                    Known ✓
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveCardIndex((prev) => Math.min(prev + 1, (studyPack.flashcards?.length || 1) - 1));
                  }}
                  disabled={activeCardIndex === (studyPack.flashcards?.length || 1) - 1}
                  className="px-4 py-2 rounded-xl bg-[#161a24] border border-[#2b3345] text-xs font-semibold text-gray-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: 10-QUESTION MINI TEST */}
          {/* ================================================================= */}
          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#11141c] border border-[#212736] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {studyPack.miniTest?.title || 'Lecture Mini-Test'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    10 Questions automatically tailored to this lecture. Tests retention & identifies weak areas.
                  </p>
                </div>
                {testSubmitted && (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold text-center">
                    Score: {testScore} / {studyPack.miniTest?.questions?.length || 10}
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {studyPack.miniTest?.questions?.map((q: any, idx: number) => {
                  const selectedOpt = testAnswers[q.id];
                  return (
                    <div key={q.id || idx} className="p-5 rounded-2xl bg-[#11141c] border border-[#212736] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-orange-400">Question {idx + 1} of 10</span>
                        <span className="text-gray-400 text-[11px]">{q.topic}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{q.text}</p>

                      <div className="space-y-2 pt-1">
                        {q.options?.map((opt: string, optIdx: number) => {
                          const isSelected = selectedOpt === opt;
                          const isCorrect = testSubmitted && opt === q.correctAnswer;
                          const isWrong = testSubmitted && isSelected && !isCorrect;

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerSelect(q.id, opt)}
                              className={`w-full p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200 font-bold'
                                  : isWrong
                                  ? 'bg-red-950/30 border-red-500 text-red-200 line-through'
                                  : isSelected
                                  ? 'bg-orange-500/20 border-orange-500 text-white font-semibold'
                                  : 'bg-[#151924] border-[#242b3b] text-gray-300 hover:border-gray-500'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && !testSubmitted && (
                                <span className="w-2 h-2 rounded-full bg-orange-400" />
                              )}
                              {isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                              {isWrong && <X className="w-4 h-4 text-red-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {testSubmitted && (
                        <div className="p-3 rounded-lg bg-[#161a24] text-xs text-gray-300">
                          <p><strong className="text-orange-400">Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!testSubmitted ? (
                <div className="text-center pt-2">
                  <button
                    onClick={handleSubmitMiniTest}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all"
                  >
                    Submit Mini-Test
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#141720] border border-[#232938] text-center space-y-2">
                  <p className="text-sm font-bold text-white">Test completed!</p>
                  <p className="text-xs text-gray-400">
                    Your performance has been recorded. Weak concepts are automatically flagged for revision.
                  </p>
                  <button
                    onClick={() => {
                      setTestSubmitted(false);
                      setTestAnswers({});
                    }}
                    className="text-xs font-semibold text-orange-400 hover:underline"
                  >
                    Retake Test
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 8: ASK THIS VIDEO TUTOR */}
          {/* ================================================================= */}
          {activeTab === 'ask' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-[#11141c] border border-orange-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-white">
                    Ask This Video (Contextual AI Tutor)
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Ask questions like: "Explain the derivation at 17:45 in simpler words", "What formula was used for numericals?", or "Explain this topic like I am learning it for the first time."
                </p>
              </div>

              {/* Chat Thread */}
              <div className="min-h-[300px] max-h-[450px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-[#0e1118] border border-[#1f2433]">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-orange-500 text-white rounded-tr-none'
                          : 'bg-[#161a24] text-gray-200 border border-[#252c3c] rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-[#161a24] text-xs text-gray-400 flex items-center gap-2 border border-[#252c3c]">
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                      <span>Reviewing lecture notes...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask any question about this lecture..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[#141822] border border-[#262e3f] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-4 py-3 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-40 transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
