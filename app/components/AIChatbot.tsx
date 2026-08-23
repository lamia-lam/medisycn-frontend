"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Minimize2,
  Stethoscope,
  Send,
  User,
  Bot,
  AlertCircle,
} from "lucide-react";

type Specialty = { name: string; score: number };

interface Message {
  id: string;
  role: "user" | "bot" | "error";
  text: string;
  specialties?: Specialty[];
  parsedSymptom?: string;
}

const API_BASE = "http://127.0.0.1:8000";

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "bot",
  text: "Hi! I'm your MediSync AI assistant 👋\n\nDescribe your symptoms and I'll suggest which specialist you should visit.",
};

// ── Specialty Recommendation Breakdown ────────────────────────────────────
function SpecialtyCard({ specialties }: { specialties: Specialty[] }) {
  const maxScore = specialties[0]?.score ?? 1;

  return (
    <div className="mt-2 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden text-sm w-full">
      <div className="px-3 py-2 bg-gradient-to-r from-cyan-50 to-cyan-100 border-b border-cyan-100">
        <p className="font-semibold text-cyan-700 text-xs uppercase tracking-wide">
          Recommended Specialists
        </p>
      </div>

      <ul className="divide-y divide-gray-50">
        {specialties.map((spec, i) => {
          const pct = Math.round((spec.score / maxScore) * 100);
          const isTop = i === 0;

          return (
            <li key={spec.name} className="px-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-800">{spec.name}</span>
                <span
                  className={`text-[11px] font-semibold border rounded-full px-2 py-0.5 ${isTop
                      ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                >
                  {spec.score.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isTop ? "#06b6d4" : "#94a3b8",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[10px] text-gray-400 px-3 py-2 bg-gray-50 border-t border-gray-100">
        ⚠️ For informational purposes only. Always consult a qualified doctor.
      </p>
    </div>
  );
}

// ── Chat Bubble ─────────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const isError = msg.role === "error";

  return (
    <div className={`flex gap-2 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <span
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs mt-0.5 ${isUser
            ? "bg-cyan-600"
            : isError
              ? "bg-red-500"
              : "bg-gradient-to-br from-cyan-500 to-cyan-700"
          }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5" />
        ) : isError ? (
          <AlertCircle className="w-3.5 h-3.5" />
        ) : (
          <Bot className="w-3.5 h-3.5" />
        )}
      </span>

      <div className={`max-w-[85%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {msg.parsedSymptom && (
          <p className="text-[10px] text-gray-400 italic px-1">
            Parsed symptom: &ldquo;{msg.parsedSymptom}&rdquo;
          </p>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line ${isUser
              ? "bg-cyan-600 text-white rounded-tr-sm"
              : isError
                ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm"
                : "bg-white border border-gray-200 text-gray-700 shadow-sm rounded-tl-sm"
            }`}
        >
          {msg.text}
        </div>
        {msg.specialties && msg.specialties.length > 0 && (
          <SpecialtyCard specialties={msg.specialties} />
        )}
      </div>
    </div>
  );
}

// ── Main AIChatbot Component ────────────────────────────────────────────────
export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // 1. Add user message to state
    const userMsgId = Math.random().toString(36).slice(2);
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      // Step A: Hit /parse endpoint to standardize input text
      const parseRes = await fetch(
        `${API_BASE}/parse?text=${encodeURIComponent(text)}`
      );
      if (!parseRes.ok) throw new Error("Parse API failed");
      const parsedSymptom = await parseRes.json();

      // Step B: Hit /classify endpoint with parsed symptom
      const classifyRes = await fetch(
        `${API_BASE}/classify?text=${encodeURIComponent(parsedSymptom)}`
      );
      if (!classifyRes.ok) throw new Error("Classify API failed");
      const classifyData: Record<string, number> = await classifyRes.json();

      // Step C: Format & sort specialties
      const specialties: Specialty[] = Object.entries(classifyData)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score);

      const topSpecialist = specialties[0]?.name ?? "a specialist";

      // 2. Add AI response to state
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: "bot",
          text: `Based on your symptoms, I recommend consulting a **${topSpecialist}**. Here is the prediction breakdown:`,
          parsedSymptom: String(parsedSymptom),
          specialties,
        },
      ]);
    } catch {
      // 3. Add error message if server is offline or fails
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: "error",
          text: "Sorry, unable to connect to the AI service. Please make sure FastAPI is running at http://127.0.0.1:8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* ── Chat Window Modal ────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col w-[380px] max-w-[90vw] h-[520px] max-h-[80vh] bg-slate-50 dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          role="dialog"
          aria-label="MediSync AI Chatbot"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-500 px-4 py-3.5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">MediSync Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-cyan-100 text-[11px]">AI Online</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} />
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2 items-center">
                <span className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white">
                  <Bot className="w-3.5 h-3.5" />
                </span>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms..."
                disabled={loading}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Press Enter to send · Powered by MediSync FastAPI
            </p>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button ──────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="bg-gray-900/80 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ask MediSync AI
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Assistant" : "Open Assistant"}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-xl hover:shadow-cyan-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          {isOpen ? <Minimize2 className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
}

