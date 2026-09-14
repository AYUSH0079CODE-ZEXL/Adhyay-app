import React, { useEffect } from 'react';
import {
  Shield,
  Lock,
  Eye,
  FileText,
  AlertCircle,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack?: () => void;
  isStandalone?: boolean;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({
  onBack,
  isStandalone = false,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy — ADHYAY AI Study Companion';
  }, []);

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate to root
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
                LEGAL
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
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy & Data Protection</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ADHYAY Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl">
            This Privacy Policy explains how <strong>ADHYAY</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the application&rdquo;) collects, uses, processes, and protects your information when you access or use the ADHYAY AI Study &amp; Exam Companion web application (hosted on GitHub Pages and Cloud environments).
          </p>
        </div>

        {/* Quick Summary Card */}
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-[#121620] border border-orange-500/20 space-y-4">
          <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Key Highlights for Students &amp; Reviewers</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-300 leading-relaxed">
            <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2433]">
              <strong className="text-white block mb-1">Google Sign-In Scope</strong>
              We only request basic identity information (email, public name, and profile avatar). We do not access Google Drive, Gmail, or your Google contacts.
            </div>
            <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2433]">
              <strong className="text-white block mb-1">Study Material Usage</strong>
              Uploaded notes, video links, or question photos are used strictly to generate your requested study notes, flashcards, and exam solutions.
            </div>
            <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2433]">
              <strong className="text-white block mb-1">No Data Resale</strong>
              We do not sell student data, personal information, or uploaded notes to advertisers, brokers, or third-party marketing networks.
            </div>
            <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2433]">
              <strong className="text-white block mb-1">Full User Control</strong>
              You can log out at any time, delete local study notes, or request permanent deletion of your account and profile data.
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-sm text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                1
              </span>
              <span>About ADHYAY &amp; Purpose of the Application</span>
            </h2>
            <p>
              ADHYAY is an educational, student-focused AI study companion platform designed to assist Indian students and competitive aspirants (such as CBSE, JEE, NEET, ICSE, and state boards) in synthesizing lecture video notes, organizing study vaults, solving doubts step-by-step, taking active recall tests, and tracking daily revision targets.
            </p>
            <p>
              ADHYAY is an educational project maintained by its developer and creator team. We do not represent a commercial corporate entity; our goal is providing accessible, intelligent study aids to learners.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                2
              </span>
              <span>Information We Collect &amp; Process</span>
            </h2>
            <p>
              Depending on how you interact with ADHYAY, we may collect and process the following categories of information:
            </p>
            <div className="space-y-3 pl-2 sm:pl-4">
              <div className="p-4 rounded-xl bg-[#11141c] border border-[#1f2536] space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-400" />
                  <span>A. Account &amp; Authentication Credentials</span>
                </div>
                <p className="text-xs text-gray-400">
                  When you sign in via <strong>Google Sign-In</strong> or <strong>Student Email</strong>, we receive your email address, full name, profile avatar URL (if provided by Google), and a unique authenticated user ID assigned by Supabase Auth. We do not store or see your raw Google password. Passwords created via email signup are cryptographically hashed and secured by Supabase Auth.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#11141c] border border-[#1f2536] space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>B. Uploaded Study Materials &amp; Lecture Data</span>
                </div>
                <p className="text-xs text-gray-400">
                  When you upload or input study content (such as YouTube video links, lecture transcripts, handwritten notes, PDF study guides, or photos of textbook problems for Scan &amp; Solve), this data is processed to extract key formulas, chapter outlines, revision summaries, and conceptual explanations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#11141c] border border-[#1f2536] space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>C. AI Interaction &amp; Generated Content</span>
                </div>
                <p className="text-xs text-gray-400">
                  Questions asked to the AI Doubt Tutor, active recall quiz responses, practice mock answers, and generated revision flashcards are processed to provide immediate feedback, marking evaluations, and score calculations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#11141c] border border-[#1f2536] space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>D. Study Progress &amp; Community Contributions</span>
                </div>
                <p className="text-xs text-gray-400">
                  Your daily streaks, XP points, study sprint logs, mock test scores, peer doubts posted to the community forum, and study group chat messages are stored to maintain your personalized study dashboard and facilitate peer collaboration.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                3
              </span>
              <span>Authentication via Google Sign-In &amp; Supabase</span>
            </h2>
            <p>
              ADHYAY provides student authentication through two secure methods:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm pl-2">
              <li>
                <strong>Google Sign-In (OAuth 2.0):</strong> We utilize standard Google OAuth 2.0 authentication. When you click &ldquo;Continue with Google&rdquo;, you are redirected to Google&rsquo;s official authentication server. We explicitly request only the minimal <code>email</code> and <code>profile</code> scopes. We do <em>not</em> access your Gmail, Google Drive files, calendar events, contacts, or any other private Google service.
              </li>
              <li>
                <strong>Supabase Authentication:</strong> Supabase provides our backend identity verification and token management. Supabase manages secure JSON Web Tokens (JWTs), token refresh lifecycles, and Row-Level Security (RLS) policies to ensure that your authenticated sessions remain encrypted and protected.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                4
              </span>
              <span>How We Use &amp; Process Your Data</span>
            </h2>
            <p>We process collected data exclusively for the following legitimate educational purposes:</p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#11141c] border border-[#1c2230]">
                <strong className="text-orange-300 block mb-1">Delivering AI Study Tools</strong>
                Generating detailed chapter notes, structured formula cards, and step-by-step problem derivations requested by you.
              </div>
              <div className="p-3.5 rounded-xl bg-[#11141c] border border-[#1c2230]">
                <strong className="text-orange-300 block mb-1">Active Recall &amp; Mock Grading</strong>
                Evaluating your submitted answers against grading rubrics and providing diagnostic suggestions for weak concept areas.
              </div>
              <div className="p-3.5 rounded-xl bg-[#11141c] border border-[#1c2230]">
                <strong className="text-orange-300 block mb-1">Session &amp; Progress Persistence</strong>
                Maintaining your personalized study streak, subject completion statistics, and saved materials across study sessions.
              </div>
              <div className="p-3.5 rounded-xl bg-[#11141c] border border-[#1c2230]">
                <strong className="text-orange-300 block mb-1">Community Discussion &amp; Peer Doubts</strong>
                Displaying questions and peer solutions shared in the Doubts forum or student study groups.
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                5
              </span>
              <span>Third-Party Subprocessors &amp; AI Services</span>
            </h2>
            <p>
              To deliver AI and database functionality, ADHYAY relies on trusted third-party technology providers:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm pl-2">
              <li className="p-3 rounded-xl bg-[#11141c] border border-[#1d2333]">
                <strong className="text-white">Google Gemini API / Google Cloud:</strong> Provides natural language processing, video understanding, handwritten question OCR, and structured note generation. Requests are proxied securely server-side; API keys are never exposed to the client browser.
              </li>
              <li className="p-3 rounded-xl bg-[#11141c] border border-[#1d2333]">
                <strong className="text-white">Supabase:</strong> Provides managed PostgreSQL database services, session token generation, and authentication infrastructure with encrypted data transfer (TLS/HTTPS).
              </li>
              <li className="p-3 rounded-xl bg-[#11141c] border border-[#1d2333]">
                <strong className="text-white">GitHub Pages:</strong> Hosts the static web client assets (HTML, CSS, JavaScript) delivered over HTTPS with global CDN distribution.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                6
              </span>
              <span>Data Retention, Account Deletion &amp; User Rights</span>
            </h2>
            <p>
              We believe in giving students straightforward, unhindered control over their personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm pl-2">
              <li>
                <strong>Sign Out &amp; Local Cache Removal:</strong> Clicking &ldquo;Sign Out&rdquo; immediately invalidates your active session and clears tokens stored in browser local storage and cookies.
              </li>
              <li>
                <strong>Study Material Removal:</strong> You can remove individual study items or clear lecture notes directly from your study vault within the application.
              </li>
              <li>
                <strong>Complete Account &amp; Data Deletion:</strong> If you wish to delete your ADHYAY user account and all associated profile records, you may email us at <a href="mailto:fireslash79@gmail.com" className="text-orange-400 underline font-mono">fireslash79@gmail.com</a> with the subject line &ldquo;ADHYAY Account Deletion Request&rdquo;. We will delete your account record and associated data from Supabase Auth and database tables without undue delay.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                7
              </span>
              <span>Important Disclaimer: AI-Generated Educational Content</span>
            </h2>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Verification Advisory for Students</span>
              </div>
              <p className="leading-relaxed">
                Educational summaries, step-by-step problem solutions, formula sheets, active recall flashcards, and mock test questions generated by ADHYAY are powered by probabilistic artificial intelligence models. While we design prompts for high academic precision, AI models may occasionally generate inaccurate steps, outdated syllabus interpretations, or hallucinations.
              </p>
              <p className="leading-relaxed">
                ADHYAY is intended as an assistive revision companion. Students should always cross-check critical formulas, derivations, and answers against official textbooks (e.g., NCERT), certified teacher solutions, and official exam board marking schemes prior to formal examinations.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-mono font-bold">
                8
              </span>
              <span>Contact Us</span>
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact the developer team:
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
              href="#/terms"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '/terms';
              }}
              className="text-orange-400 hover:underline"
            >
              Terms of Service
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
