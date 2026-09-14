import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Camera,
  FileText,
  Youtube,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyMaterial, MaterialType } from '../types';
import { apiUrl } from '../lib/api';


export const UploadModal: React.FC = () => {
  const { isUploadOpen, setIsUploadOpen, user, addStudyMaterial, setActiveTab, showToast } = useApp();

  const [activeTabMode, setActiveTabMode] = useState<'upload' | 'youtube' | 'typed'>('upload');
  const [title, setTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0] || 'Physics');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [academicLevel, setAcademicLevel] = useState(user.classGrade || 'Class 12');
  const [typedText, setTypedText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<MaterialType>('pdf');
  const [isHandwritten, setIsHandwritten] = useState(false);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (file.type.startsWith('image/')) {
      setFileType('image');
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFileType('pdf');
      setImagePreview(null);
    }

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleProcessAndSave = async () => {
    if (activeTabMode === 'youtube' && !youtubeUrl) {
      showToast('Please enter a valid YouTube lecture URL', 'warning');
      return;
    }
    if (activeTabMode === 'typed' && !typedText.trim()) {
      showToast('Please write or paste study notes', 'warning');
      return;
    }
    if (activeTabMode === 'upload' && !fileName && !typedText) {
      showToast('Please select a file or take a photo', 'warning');
      return;
    }

    setProcessing(true);
    setProgressStage(1); // Reading content

    try {
      if (activeTabMode === 'youtube') {
        setTimeout(() => setProgressStage(2), 600); // Identifying timestamps
        setTimeout(() => setProgressStage(3), 1200); // Generating notes & MCQs

        const res = await fetch(apiUrl('/api/gemini/process-video'), {
          method: 'POST',

          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: youtubeUrl,
            lectureTitle: title || 'YouTube Lecture Masterclass',
            subject: selectedSubject,
          }),
        });

        const data = await res.json();
        const pack = data.pack;

        const newMaterial: StudyMaterial = {
          id: `mat_yt_${Date.now()}`,
          title: title || pack?.title || 'YouTube Lecture Study Pack',
          type: 'youtube',
          subject: selectedSubject,
          chapter: chapter || pack?.chapter || 'Video Masterclass',
          topic: topic || 'Lecture Concepts & Derivations',
          academicLevel,
          sourceUrl: youtubeUrl,
          summary: pack?.summary || 'AI-generated study pack from YouTube lecture.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [selectedSubject, 'YouTube', 'Lecture Pack', user.boardOrExam],
          isFavorite: false,
          videoChapters: pack?.videoChapters,
          notes: {
            complete: pack?.notes?.complete || 'Complete lecture notes.',
            easy: pack?.notes?.easy || 'Simplified breakdown.',
            revision: pack?.notes?.revision || 'Quick revision sheet.',
            ultraQuick: pack?.notes?.ultraQuick || '1-minute recap.',
            formulaSheet: pack?.keyFormulas?.map((f: any) => ({
              formula: f.formula,
              description: f.description,
              symbols: '',
              units: f.units || '',
              conditions: '',
              whenToUse: '',
            })) || [],
            definitions: [],
            derivations: [],
            examples: [],
            commonMistakes: [],
            exceptions: [],
            diagrams: [],
          },
          flashcards: pack?.flashcards?.map((fc: any) => ({
            id: fc.id || `fc_${Date.now()}`,
            front: fc.front,
            back: fc.back,
            type: fc.type || 'concept',
            subject: selectedSubject,
            chapter: chapter || 'Lecture',
            masteryLevel: 0,
          })),
          questions: pack?.mcqs,
        };

        addStudyMaterial(newMaterial);
        setIsUploadOpen(false);
        setActiveTab('vault');
      } else {
        // Standard Document / Image / Handwritten Notes
        setTimeout(() => setProgressStage(2), 700); // Detecting formulas & handwriting
        setTimeout(() => setProgressStage(3), 1500); // Creating multi-format explanations

        const res = await fetch(apiUrl('/api/gemini/generate-notes'), {
          method: 'POST',

          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || fileName || 'Study Notes',
            subject: selectedSubject,
            chapter: chapter || title,
            rawText: typedText || (fileName ? `Material uploaded: ${fileName}` : ''),
            academicLevel,
            imageData: imagePreview,
          }),
        });

        const data = await res.json();
        const generatedNotes = data.notes;

        const newMaterial: StudyMaterial = {
          id: `mat_${Date.now()}`,
          title: title || fileName || 'Uploaded Study Material',
          type: isHandwritten ? 'handwritten' : fileType,
          subject: selectedSubject,
          chapter: chapter || 'Chapter Notes',
          topic: topic || 'Core Concepts',
          academicLevel,
          originalFileName: fileName,
          rawText: typedText,
          imageUrl: imagePreview || undefined,
          summary: `Comprehensive academic pack for ${chapter || title || selectedSubject} (${user.boardOrExam}).`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [selectedSubject, isHandwritten ? 'Handwritten' : 'Notes', user.boardOrExam],
          isFavorite: false,
          notes: generatedNotes,
          flashcards: [
            {
              id: `fc_${Date.now()}_1`,
              front: `What is the core definition in ${chapter || title}?`,
              back: generatedNotes?.definitions?.[0]?.definition || `Fundamental concept of ${selectedSubject}.`,
              type: 'definition',
              subject: selectedSubject,
              chapter: chapter || 'Notes',
              masteryLevel: 0,
            },
            {
              id: `fc_${Date.now()}_2`,
              front: `What is the primary formula in ${chapter || title}?`,
              back: generatedNotes?.formulaSheet?.[0]?.formula || `Key equation for ${selectedSubject}.`,
              type: 'formula',
              subject: selectedSubject,
              chapter: chapter || 'Notes',
              masteryLevel: 0,
            },
          ],
        };

        addStudyMaterial(newMaterial);
        setIsUploadOpen(false);
        setActiveTab('vault');
      }
    } catch (err) {
      console.error(err);
      showToast('Error processing material. Saved local draft.', 'warning');
    } finally {
      setProcessing(false);
      setProgressStage(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#11141c] border border-[#232938] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2330] bg-[#141720]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base text-white">
                  Add Study Material to Vault
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20">
                  AI Auto-Organize
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                PDFs, handwritten notes, photos, textbooks, and YouTube lectures
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsUploadOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c2230]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 px-5 pt-3 border-b border-[#1b202c] bg-[#0d1016]">
          {[
            { id: 'upload', label: '📁 Upload File / Photo', icon: FileText },
            { id: 'youtube', label: '🎥 YouTube Lecture', icon: Youtube },
            { id: 'typed', label: '✍️ Type / Paste Notes', icon: FileCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabMode(tab.id as any)}
              className={`py-2.5 px-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTabMode === tab.id
                  ? 'border-orange-500 text-orange-400 bg-[#161a25]'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {processing ? (
            /* Meaningful Progress State */
            <div className="py-12 px-6 text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-lg shadow-orange-500/20 animate-pulse">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-white">
                  Understanding your study material...
                </h4>
                <p className="text-xs text-gray-400">
                  Extracting formulas, detecting chapter hierarchy, and creating easy notes.
                </p>
              </div>

              {/* Progress Stepper */}
              <div className="max-w-md mx-auto space-y-2.5 text-left text-xs">
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reading document content & structure</span>
                </div>
                <div
                  className={`flex items-center gap-2.5 transition-opacity duration-300 ${
                    progressStage >= 2 ? 'text-emerald-400 font-medium' : 'text-gray-500'
                  }`}
                >
                  {progressStage >= 2 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                  )}
                  <span>Detecting handwritten formulas & diagrams</span>
                </div>
                <div
                  className={`flex items-center gap-2.5 transition-opacity duration-300 ${
                    progressStage >= 3 ? 'text-emerald-400 font-medium' : 'text-gray-500'
                  }`}
                >
                  {progressStage >= 3 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-600" />
                  )}
                  <span>Generating Complete Notes, Easy Notes & Formula Sheet</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tab 1: File / Photo Upload */}
              {activeTabMode === 'upload' && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#2b3345] hover:border-orange-500/70 bg-[#141822] hover:bg-[#181d2a] rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-200">
                        Click to select PDF or image file
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Supports handwritten notes, textbook pages, question papers
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cameraInputRef.current?.click();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202738] hover:bg-[#283248] text-gray-200 text-xs font-semibold border border-[#303b54] transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-orange-400" />
                        <span>Take Camera Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Preview if image selected */}
                  {imagePreview && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a25] border border-[#262c3c]">
                      <div className="flex items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Upload preview"
                          className="w-12 h-12 rounded-lg object-cover ring-1 ring-orange-500/30"
                        />
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[200px]">
                            {fileName || 'Photo uploaded'}
                          </div>
                          <span className="text-[10px] text-gray-400">Ready for AI processing</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFileName('');
                        }}
                        className="text-xs text-red-400 hover:text-red-300 p-1"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Handwritten Note Toggle */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#141822] border border-[#232938] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isHandwritten}
                      onChange={(e) => setIsHandwritten(e.target.checked)}
                      className="rounded accent-orange-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-200">
                        This is a handwritten note / coaching notebook
                      </span>
                      <p className="text-[11px] text-gray-400">
                        Enables deep handwriting OCR and mathematical symbol recognition.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Tab 2: YouTube Lecture */}
              {activeTabMode === 'youtube' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">
                      YouTube Lecture Video URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                      <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-2.5" />
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Paste lecture URL (e.g. Physics Wallah, Unacademy, Khan Academy India, NPTEL, Mohit Tyagi).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#151924] border border-[#242b3c] space-y-1 text-xs">
                    <div className="font-bold text-orange-400">Video → Complete Study Pack:</div>
                    <ul className="list-disc list-inside text-[11px] text-gray-300 space-y-0.5">
                      <li>Auto-identifies chapter sections with clickable timestamps</li>
                      <li>Extracts complete easy notes and formula sheet</li>
                      <li>Generates 4 practice MCQs and review flashcards</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 3: Typed Notes */}
              {activeTabMode === 'typed' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">
                    Write / Paste Notes or Syllabus Text
                  </label>
                  <textarea
                    rows={6}
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder="Paste textbook excerpt, lecture summary, or class notes here..."
                    className="w-full p-3 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}

              {/* Metadata Form: Title, Subject, Chapter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1e2330]">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Title / Document Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Current Electricity & Drift Velocity"
                    className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Chapter / Unit</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="e.g. Chapter 3: Current Electricity"
                    className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Academic Level</label>
                  <input
                    type="text"
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    placeholder="e.g. Class 12 / JEE Main"
                    className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!processing && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#1e2330] bg-[#141720]">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1b202c]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProcessAndSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Multi-Format Study Pack</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
