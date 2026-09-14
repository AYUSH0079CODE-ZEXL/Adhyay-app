import React, { useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Users,
  ShieldCheck,
  Mail,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Cpu,
} from 'lucide-react';

interface TermsViewProps {
  onBack?: () => void;
  isStandalone?: boolean;
}

export const TermsView: React.FC<TermsViewProps> = ({
  onBack,
  isStandalone = false,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms of Service — ADHYAY AI Study Companion';
  }, []);

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else {
      if (window.location.pathname.includes('/Adhyay-app')) {
        window.location.href = '/Adhyay-app/';
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#f1f3f7] font-sans selection:bg-orange-500 selection:text-white pb-20">
      {/* Header Banner */}
      <header className="sticky top-0 z-30 bg-[#0e1118]/90 backdrop-blur-md border-b border-[#1c2230]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReturn}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white bg-[#161a24] hover:bg-[#1f2533] px-3 py-1.5 rounded-xl border border-[#273042] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
              <span>Back to App</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-700/60">
              <span className="font-heading font-black text-lg text-white tracking-tight">
                ADHYAY
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/15 text-orange-400 rounded-full border border-orange-500/30">
                TERMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>Last Updated: September 2026</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Title Hero */}
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>User Agreement &amp; Acceptable Use</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ADHYAY Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl">
            Welcome to <strong>ADHYAY</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the application&rdquo;). By accessing, browsing, or using the ADHYAY web application or our AI study companion features, you agree to comply with and be bound by the following Terms of Service.
          </p>
        </div>

        {/* Quick Highlights Box */}
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-[#121620] border border-orange-500/20 space-y-4">
          <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Core Principles at a Glance</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-300 leading-relaxed">
            <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2433]">
              <strong className="text-white block mb-1">Educational Purpose</strong>
              ADHYAY is built for study, revision, concept clarification, and self-assessment. It is an assistive revision companion.
            </div>
            <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2433]">
              <strong className="text-white block mb-1">Academic Integrity</strong>
              Do not use ADHYAY to cheat in live examinations or distribute leaked question papers. Use it to understand and learn.
            </div>
            <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2433]">
              <strong className="text-white block mb-1">AI Output Verification</strong>
              AI explanations may occasionally contain errors. Always verify critical formulas and high-stakes answers with official textbooks.
            </div>
            <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2433]">
              <strong className="text-white block mb-1">Respectful Community</strong>
              Maintain friendly, supportive behavior in the Doubts forum and study groups. Hate speech, bullying, and spam are strictly prohibited.
            </div>
          </div>
        </div>

        {/* Detailed Terms */}
        <div className="space-y-10 text-sm text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                1
              </span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By accessing ADHYAY through GitHub Pages, our Cloud Run application, or any affiliated domain, you confirm that you have read, understood, and agreed to these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use the application.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                2
              </span>
              <span>Description of Service &amp; Eligibility</span>
            </h2>
            <p>
              ADHYAY provides student-oriented study tools, including automated lecture video note extraction, AI-powered problem solving, active recall quizzes, mock test generation, and peer study groups.
            </p>
            <p>
              The service is accessible to students, competitive exam aspirants (e.g., CBSE, JEE Main/Advanced, NEET, ICSE, and state boards), educators, and independent learners. If you are under the age of majority in your jurisdiction, you represent that you have parental or guardian consent to use the service.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                3
              </span>
              <span>Account Registration &amp; Security</span>
            </h2>
            <p>
              You can access ADHYAY by authenticating via <strong>Google Sign-In</strong> or <strong>Student Email</strong> through Supabase Authentication. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
              <li>Provide accurate identification information (email and name).</li>
              <li>Maintain the confidentiality of your session credentials and email accounts.</li>
              <li>Notify us immediately if you suspect unauthorized access to your account.</li>
              <li>Accept responsibility for all activities conducted under your authenticated account.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                4
              </span>
              <span>Academic Integrity &amp; Acceptable Use Policy</span>
            </h2>
            <p>
              ADHYAY is designed to accelerate learning, reinforce concepts, and reduce study friction. You explicitly agree NOT to use the service for:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs mt-2">
              <div className="p-3 rounded-xl bg-[#11141c] border border-red-500/20 text-gray-300">
                <strong className="text-red-300 block mb-1">Live Exam Cheating</strong>
                Submitting questions during an ongoing, proctored school, university, or national entrance examination.
              </div>
              <div className="p-3 rounded-xl bg-[#11141c] border border-red-500/20 text-gray-300">
                <strong className="text-red-300 block mb-1">Unauthorized Material Leaks</strong>
                Uploading or circulating confidential examination papers, leaked question sets, or copyrighted test series.
              </div>
              <div className="p-3 rounded-xl bg-[#11141c] border border-red-500/20 text-gray-300">
                <strong className="text-red-300 block mb-1">Malicious Input</strong>
                Injecting malicious scripts, attempting unauthorized database queries, or reverse-engineering server APIs.
              </div>
              <div className="p-3 rounded-xl bg-[#11141c] border border-red-500/20 text-gray-300">
                <strong className="text-red-300 block mb-1">Commercial Exploitation</strong>
                Selling, scraping, or mass-redistributing generated AI content for commercial profit without authorization.
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                5
              </span>
              <span>Community Conduct &amp; Content Moderation</span>
            </h2>
            <p>
              In community areas, including the <strong>Doubts Community</strong> and <strong>Study Groups</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
              <li>Students must communicate with mutual respect and helpful intent.</li>
              <li>Harassment, abusive language, bullying, profanity, or sexually explicit content is strictly forbidden.</li>
              <li>Spam, promotional solicitations, and deceptive links are not permitted.</li>
              <li>We reserve the right to remove offensive content and suspend or terminate accounts that violate community safety rules.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                6
              </span>
              <span>AI Technology Disclaimer &amp; Limitations</span>
            </h2>
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-orange-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-orange-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-orange-400" />
                <span>No Warranty on AI Outputs</span>
              </div>
              <p className="leading-relaxed">
                The educational outputs (summaries, formulas, step-by-step solutions, quiz rubrics, mock exams) are generated by automated generative AI models (such as Google Gemini). AI models can make mathematical errors, misquote scientific facts, or present outdated syllabus conventions.
              </p>
              <p className="leading-relaxed">
                ADHYAY is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind. You assume full responsibility for verifying all answers, derivations, and solutions against recognized educational resources (such as NCERT textbooks, teachers, and official exam authorities).
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                7
              </span>
              <span>Intellectual Property</span>
            </h2>
            <p>
              You retain all rights to the personal notes, questions, and original materials that you input or upload to the platform. By submitting content, you grant ADHYAY a limited, non-exclusive license to process, format, and display that content solely to deliver your requested study features.
            </p>
            <p>
              The ADHYAY interface design, code, branding, and proprietary assets are the intellectual property of the project creators and protected by applicable copyright and software laws.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                8
              </span>
              <span>Limitation of Liability</span>
            </h2>
            <p>
              To the fullest extent permitted by law, ADHYAY and its maintainers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use the service, including but not limited to exam outcomes, academic performance, loss of study notes, or reliance on AI-generated answers.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                9
              </span>
              <span>Contact Information</span>
            </h2>
            <p>
              If you have questions regarding these Terms of Service or need assistance, you can contact the developer team:
            </p>
            <div className="p-4 rounded-xl bg-[#11141c] border border-[#202738] space-y-2 text-xs">
              <p className="flex items-center gap-2 text-gray-200">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Email:</span>
                <a href="mailto:fireslash79@gmail.com" className="text-orange-400 hover:underline font-mono">
                  fireslash79@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2 text-gray-200">
                <ExternalLink className="w-4 h-4 text-orange-400 shrink-0" />
                <span>GitHub Repository:</span>
                <a
                  href="https://github.com/ayush0079code-zexl/Adhyay-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:underline font-mono"
                >
                  https://github.com/ayush0079code-zexl/Adhyay-app
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-6 border-t border-[#1c2230] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 ADHYAY — Student-Focused AI Study Companion</p>
          <div className="flex items-center gap-4">
            <a
              href="#/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '/privacy-policy';
              }}
              className="text-orange-400 hover:underline"
            >
              Privacy Policy
            </a>
            <button
              onClick={handleReturn}
              className="text-gray-300 hover:text-white"
            >
              Back to App
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
