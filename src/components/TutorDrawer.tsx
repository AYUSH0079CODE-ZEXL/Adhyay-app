import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const TutorDrawer: React.FC = () => {
  const { isTutorOpen, setIsTutorOpen, user, activeMaterial, materials, addXP } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_init',
      sender: 'ai',
      text: `Namaste ${user.name}! 🙏 I'm **Guru**, your personal AI study companion.

I know you are preparing for **${user.targetExam || user.boardOrExam}** (${user.classGrade}, ${user.stream}).

What would you like to master today?
- Ask to explain any difficult concept in simple language
- Practice tricky numericals or assertion-reason questions
- Ask for high-yield exam tips and common pitfalls`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0] || 'Physics');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTutorOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTutorOpen]);

  if (!isTutorOpen) return null;

  const quickPrompts = [
    'Explain Lenz’s Law with an everyday analogy',
    'What are the 3 most common mistakes students make in Nernst equation?',
    'Give me 2 tricky numericals with step-by-step solutions',
    'How should I present a 5-mark derivation in Board Exams?',
  ];

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const relevantNotes = materials
        .filter((m) => m.subject.toLowerCase() === selectedSubject.toLowerCase())
        .map((m) => `${m.title}: ${m.summary}\n${m.notes?.complete || ''}`)
        .join('\n\n')
        .slice(0, 4000);

      const res = await fetch('/api/gemini/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          userProfile: user,
          currentTopic: selectedSubject,
          materialContext: relevantNotes || (activeMaterial ? activeMaterial.notes?.complete : ''),
          history: messages.slice(-5),
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || "Let's review this concept together step-by-step.";

      const aiMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      addXP(15, 'Engaged in personalized AI tutor session');
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'ai',
          text: `Here is the explanation for **${textToSend}**:

Remember the golden rule of Indian examinations:
1. **Define the principle accurately** using standard NCERT keywords.
2. **State conditions of validity** (e.g. constant temperature, isolated system).
3. **Always show step-marking working** with proper SI units.

Would you like me to generate a practice question on this concept?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = (text: string, msgId: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }

      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const cleanText = text.replace(/[#*_`$]/g, '').replace(/\$\$.*?\$\$/g, 'formula');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingMsgId(msgId);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#11141c] border-l border-[#232938] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2330] bg-[#141720]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-sm text-white">Guru AI Tutor</span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-orange-500/10 text-orange-400 rounded border border-orange-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Grounded in your Study Vault & {user.boardOrExam}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (speakingMsgId) window.speechSynthesis.cancel();
            setIsTutorOpen(false);
          }}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c2230]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subject Context Bar */}
      <div className="px-4 py-2 border-b border-[#1b202c] bg-[#0f1218] flex items-center justify-between text-xs">
        <span className="text-gray-400 text-[11px]">Subject Focus:</span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {user.subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedSubject === sub
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-orange-600 text-white rounded-tr-none'
                  : 'bg-[#161a25] border border-[#262c3c] text-gray-200 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap font-normal prose-sm">
                {msg.text}
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] opacity-70">
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => handleSpeech(msg.text, msg.id)}
                    className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                    title="Read Aloud"
                  >
                    {speakingMsgId === msg.id ? (
                      <>
                        <VolumeX className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-400">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-[#222938] flex items-center justify-center text-gray-300 flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-[#161a25] border border-[#262c3c] text-xs text-gray-400 flex items-center gap-2">
              <span>Guru is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 border-t border-[#1b202c] bg-[#0d1016] space-y-1.5">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Suggested Questions
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 text-[11px] bg-[#161a25] hover:bg-[#1d2332] text-gray-300 hover:text-orange-400 border border-[#262d3e] rounded-lg whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-[#1e2330] bg-[#141720]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Guru anything in ${selectedSubject}...`}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#181c26] border border-[#282f40] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
