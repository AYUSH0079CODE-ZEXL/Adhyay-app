import React, { useState } from 'react';
import { X, Check, Sparkles, GraduationCap, School, BookOpen, Calendar, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EducationType } from '../types';

export const GoogleAuthModal: React.FC = () => {
  const { isGoogleAuthModalOpen, setIsGoogleAuthModalOpen, user, updateUser, showToast } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [educationType, setEducationType] = useState<EducationType>(user.educationType);
  const [boardOrExam, setBoardOrExam] = useState(user.boardOrExam);
  const [classGrade, setClassGrade] = useState(user.classGrade);
  const [stream, setStream] = useState(user.stream);
  const [subjectsInput, setSubjectsInput] = useState(user.subjects.join(', '));
  const [targetExam, setTargetExam] = useState(user.targetExam);
  const [targetExamDate, setTargetExamDate] = useState(user.targetExamDate || '2025-02-15');

  if (!isGoogleAuthModalOpen) return null;

  const handleSave = () => {
    const parsedSubjects = subjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateUser({
      name,
      email,
      educationType,
      boardOrExam,
      classGrade,
      stream,
      subjects: parsedSubjects.length > 0 ? parsedSubjects : user.subjects,
      targetExam,
      targetExamDate,
    });

    setIsGoogleAuthModalOpen(false);
  };

  const boardOptions = {
    school: ['CBSE Board', 'ICSE / ISC Board', 'Maharashtra State Board', 'Karnataka State / PUC', 'UP Board', 'Tamil Nadu State Board', 'Other State Board'],
    college: ['Engineering (B.Tech / BE)', 'Medical (MBBS / BDS)', 'Commerce (B.Com / BBA)', 'Sciences (B.Sc)', 'Arts / Humanities (BA)', 'Law (LLB)', 'Other University'],
    competitive: ['JEE Main & Advanced', 'NEET-UG (Medical)', 'UPSC Civil Services', 'CA Foundation / Inter', 'CUET (UG / PG)', 'GATE Exam', 'SSC CGL / Banking', 'NDA / Defense'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#11141c] border border-[#232938] shadow-2xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2330]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Student Profile & Google Account
              </h3>
              <p className="text-[11px] text-gray-400">
                Tailor AI explanations & questions to your exact curriculum
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGoogleAuthModalOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c2230]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Google Authentication Status Card */}
        <div className="p-3.5 rounded-xl bg-[#161a24] border border-[#262d3d] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-200">{user.email}</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 font-bold rounded">
                  Connected
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Signed in via Google Workspace</p>
            </div>
          </div>
          <button
            onClick={() => showToast('Switched Google account profile simulation', 'info')}
            className="px-2.5 py-1 text-[11px] font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg transition-colors"
          >
            Switch
          </button>
        </div>

        {/* Education Setup Form */}
        <div className="space-y-4">
          {/* Education Type selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Education Track</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'school', label: 'School (9-12)' },
                { id: 'college', label: 'College / Univ' },
                { id: 'competitive', label: 'Competitive' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setEducationType(item.id as EducationType);
                    setBoardOrExam(boardOptions[item.id as EducationType][0]);
                  }}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all text-center ${
                    educationType === item.id
                      ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-bold shadow-sm'
                      : 'bg-[#161a24] border-[#252b3b] text-gray-400 hover:text-gray-300 hover:bg-[#1a1f2c]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                placeholder="e.g. Aarav Sharma"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Class / Year</label>
              <input
                type="text"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                placeholder="e.g. Class 12, 2nd Year"
              />
            </div>
          </div>

          {/* Board / University / Exam Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Board / University / Exam</label>
            <select
              value={boardOrExam}
              onChange={(e) => setBoardOrExam(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {boardOptions[educationType].map((opt) => (
                <option key={opt} value={opt} className="bg-[#11141c]">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Stream */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Stream / Specialization</label>
            <input
              type="text"
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
              placeholder="e.g. Science (PCM + CS), Commerce, MBBS, CSE"
            />
          </div>

          {/* Target Exam & Optional Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Target Exam Focus</label>
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
                placeholder="e.g. CBSE 12th Boards + JEE Main 2025"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Target Exam Date (Optional)</label>
              <input
                type="date"
                value={targetExamDate}
                onChange={(e) => setTargetExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Enrolled Subjects */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">
              Enrolled Subjects (comma separated)
            </label>
            <input
              type="text"
              value={subjectsInput}
              onChange={(e) => setSubjectsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#151922] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-orange-500"
              placeholder="Physics, Chemistry, Mathematics, English"
            />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-[#141822] p-2.5 rounded-xl border border-[#202634]">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Your Study Vault is private by default. Only community questions you explicitly post are shared.</span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2330]">
          <button
            type="button"
            onClick={() => setIsGoogleAuthModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1b202c] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save & Apply Curriculum</span>
          </button>
        </div>
      </div>
    </div>
  );
};
