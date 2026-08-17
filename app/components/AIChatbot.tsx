"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Minimize2, Stethoscope, Send, Sparkles } from "lucide-react";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setHasUnread(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const toggleChat = () => {
    if (isOpen) {
      setIsAnimating(false);
      setTimeout(() => setIsOpen(false), 250);
    } else {
      setIsOpen(true);
      setHasUnread(false);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsAnimating(true))
      );
    }
  };

  return (
    <>
      {/* ── Chatbot Window ─────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col"
          style={{
            width: "clamp(320px, 90vw, 380px)",
            maxHeight: "min(550px, 85vh)",
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating
              ? "scale(1) translateY(0)"
              : "scale(0.92) translateY(16px)",
            transformOrigin: "bottom right",
            transition:
              "opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          role="dialog"
          aria-label="MediSync AI Chatbot"
          aria-modal="false"
        >
          <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="relative bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 px-4 py-3.5 shrink-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-12 translate-x-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/10 translate-y-8 -translate-x-6 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <Stethoscope
                      className="text-white"
                      style={{ width: "18px", height: "18px" }}
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-tight">
                      MediSync Assistant
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-cyan-100 text-[11px] font-medium">
                        Coming soon
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={toggleChat}
                  id="chatbot-close-btn"
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Close chatbot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Empty / Coming Soon State ─────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20 border border-cyan-100 dark:border-cyan-800/40 flex items-center justify-center shadow-sm">
                <Sparkles className="w-7 h-7 text-cyan-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-base mb-1">
                  AI Chat Coming Soon
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed max-w-[240px]">
                  Your intelligent health assistant is being set up. Check back shortly!
                </p>
              </div>
              <div className="flex gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>

            {/* ── Divider ───────────────────────────────────────────── */}
            <div className="h-px bg-gray-100 dark:bg-gray-700 mx-4 shrink-0" />

            {/* ── Disabled Input Area ───────────────────────────────── */}
            <div className="px-4 py-3 shrink-0 bg-white dark:bg-gray-800/60">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your health question..."
                  id="chatbot-input"
                  aria-label="Chat message input"
                  className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-all"
                />
                <button
                  id="chatbot-send-btn"
                  disabled
                  aria-label="Send message (coming soon)"
                  className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                AI-powered health assistant — launching soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button ──────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

        {/* Tooltip label — visible only when closed */}
        {!isOpen && (
          <div
            className="flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-none"
            style={{
              opacity: 1,
              animation: "fadeSlideUp 0.4s ease forwards",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            Ask MediSync AI
          </div>
        )}

        {/* Button */}
        <button
          id="chatbot-toggle-btn"
          onClick={toggleChat}
          aria-label={isOpen ? "Close MediSync Assistant" : "Open MediSync Assistant"}
          aria-expanded={isOpen}
          className="relative flex items-center justify-center cursor-pointer
            transition-all duration-300 active:scale-95
            focus:outline-none group"
          style={{ width: "64px", height: "64px" }}
        >
          {/* Outer glow ring */}
          {!isOpen && (
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "rgba(6,182,212,0.18)",
                animation: "outerPulse 2.4s ease-in-out infinite",
                transform: "scale(1.35)",
              }}
            />
          )}

          {/* Mid glow ring */}
          {!isOpen && (
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "rgba(6,182,212,0.28)",
                animation: "outerPulse 2.4s ease-in-out 0.6s infinite",
                transform: "scale(1.15)",
              }}
            />
          )}

          {/* Main circle */}
          <span
            className="relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)",
              boxShadow: isOpen
                ? "0 4px 16px rgba(6,182,212,0.35)"
                : "0 6px 32px rgba(6,182,212,0.55), 0 2px 8px rgba(14,116,144,0.4)",
              transition: "box-shadow 0.3s ease",
            }}
          >
            {/* Shimmer sweep */}
            {!isOpen && (
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                  animation: "shimmer 2.8s ease-in-out infinite",
                }}
              />
            )}

            {/* Icon */}
            <span className="relative z-10 text-white transition-transform duration-300 group-hover:scale-110">
              {isOpen ? (
                <Minimize2 style={{ width: "22px", height: "22px" }} />
              ) : (
                <MessageCircle style={{ width: "26px", height: "26px" }} />
              )}
            </span>
          </span>

          {/* Unread badge */}
          {hasUnread && !isOpen && (
            <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-amber-400 border-2 border-white text-white text-[10px] flex items-center justify-center font-bold shadow-md z-20">
              !
            </span>
          )}
        </button>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes outerPulse {
          0%, 100% { opacity: 0.7; transform: scale(1.15); }
          50%       { opacity: 0;   transform: scale(1.5);  }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          60%, 100% { transform: translateX(200%) skewX(-15deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
