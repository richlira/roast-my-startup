"use client";

import { useEffect, useRef } from "react";
import { Flame, RotateCcw, FileText } from "lucide-react";

interface RoastChatProps {
  messages: string;
  isLoading: boolean;
  onReset: () => void;
  fileName: string;
}

interface ParsedMessage {
  speaker: "marcus" | "victoria" | "david" | "system";
  content: string;
}

const vcConfig = {
  marcus: {
    name: "Marcus",
    emoji: "😤",
    color: "border-red-500",
    bg: "bg-red-500/10",
    textColor: "text-red-400",
  },
  victoria: {
    name: "Victoria",
    emoji: "📊",
    color: "border-purple-500",
    bg: "bg-purple-500/10",
    textColor: "text-purple-400",
  },
  david: {
    name: "David",
    emoji: "😬",
    color: "border-green-500",
    bg: "bg-green-500/10",
    textColor: "text-green-400",
  },
  system: {
    name: "Sistema",
    emoji: "🔥",
    color: "border-fire-500",
    bg: "bg-fire-500/10",
    textColor: "text-fire-400",
  },
};

function parseMessages(raw: string): ParsedMessage[] {
  const lines = raw.split("\n").filter((line) => line.trim());
  const messages: ParsedMessage[] = [];

  for (const line of lines) {
    const marcusMatch = line.match(/^\[?MARCUS\]?:?\s*(.+)/i);
    const victoriaMatch = line.match(/^\[?VICTORIA\]?:?\s*(.+)/i);
    const davidMatch = line.match(/^\[?DAVID\]?:?\s*(.+)/i);
    const systemMatch = line.match(/^\[?SYSTEM\]?:?\s*(.+)/i);

    if (marcusMatch) {
      messages.push({ speaker: "marcus", content: marcusMatch[1] });
    } else if (victoriaMatch) {
      messages.push({ speaker: "victoria", content: victoriaMatch[1] });
    } else if (davidMatch) {
      messages.push({ speaker: "david", content: davidMatch[1] });
    } else if (systemMatch) {
      messages.push({ speaker: "system", content: systemMatch[1] });
    } else if (line.trim() && messages.length > 0) {
      // Continuation of previous message
      messages[messages.length - 1].content += " " + line.trim();
    } else if (line.trim()) {
      // Default to system
      messages.push({ speaker: "system", content: line.trim() });
    }
  }

  return messages;
}

export default function RoastChat({ messages, isLoading, onReset, fileName }: RoastChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const parsedMessages = parseMessages(messages);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-lg border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-fire-500 animate-flame" />
            <div>
              <h1 className="font-display text-xl font-bold fire-text">ROAST SESSION</h1>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FileText className="w-4 h-4" />
                <span>{fileName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Nuevo Roast
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {parsedMessages.map((msg, i) => {
            const config = vcConfig[msg.speaker];
            return (
              <div
                key={i}
                className={`
                  flex gap-4 p-4 rounded-xl border animate-slide-up
                  ${config.bg} ${config.color}
                `}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${config.bg}`}>
                    {config.emoji}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm mb-1 ${config.textColor}`}>
                    {config.name}
                  </p>
                  <p className="text-gray-200 leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-4 p-4 rounded-xl border border-gray-700 bg-dark-800/50">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-fire-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-fire-500 animate-flame" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-fire-500 rounded-full animate-typing" style={{ animationDelay: "0s" }} />
                  <span className="w-2 h-2 bg-fire-500 rounded-full animate-typing" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 bg-fire-500 rounded-full animate-typing" style={{ animationDelay: "0.4s" }} />
                </div>
                <span className="text-gray-400 text-sm">Los VCs están deliberando...</span>
              </div>
            </div>
          )}

          {/* Term Sheet (shown when done) */}
          {!isLoading && parsedMessages.length > 0 && (
            <div className="mt-8 p-6 rounded-xl border-2 border-fire-500 bg-fire-500/5 animate-fade-in">
              <h3 className="font-display text-2xl font-bold fire-text mb-4 text-center">
                📜 TERM SHEET 📜
              </h3>
              <div className="text-center space-y-2 font-body">
                <p className="text-gray-300">Después de una deliberación exhaustiva...</p>
                <p className="text-2xl font-bold text-white">
                  Te ofrecemos <span className="fire-text">$50 MXN</span> por el <span className="fire-text">99%</span> de tu empresa.
                </p>
                <p className="text-gray-400 text-sm mt-4">
                  Valoración: Un café americano y una servilleta.
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  * Oferta válida por los próximos 0.3 segundos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
