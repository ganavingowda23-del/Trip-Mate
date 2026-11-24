import { Compass, Info, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { ChatMessagePayload } from '../types/trip';

interface UiChatMessage extends ChatMessagePayload {
  id: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  'What should I pack for 6 days in Kyoto during autumn?',
  'How can 2 travellers keep a 5-day Lisbon trip under $1,800?',
  'Best time of year and transit tips for the Amalfi Coast?',
  'What documents and gear are essential for trekking in Patagonia?',
];

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function SafeMessageBody({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" />;
        }
        // Render bold **segments** safely using React elements
        const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                return (
                  <strong key={pIdx} className="font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export function AssistantPage() {
  const [messages, setMessages] = useState<UiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your TripMate Travel Assistant. Ask me about destinations, packing checklists, seasonal weather, local transit, or ways to balance your travel budget.',
      timestamp: formatTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || typing) return;

    setErrorMsg(null);
    const userMsg: UiChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: clean,
      timestamp: formatTime(),
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Unable to get a response right now.');
        return;
      }
      if (data.notice) {
        setNotice(String(data.notice));
      }
      const replyMsg: UiChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: String(data.reply || ''),
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch {
      setErrorMsg('Connection interrupted. Please try sending your question again.');
    } finally {
      setTyping(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content:
          'Chat cleared. Ask anything about your next destination, packing, local transit, or budgeting.',
        timestamp: formatTime(),
      },
    ]);
    setErrorMsg(null);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-[#0B1F3A] text-white py-10 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-1.5">
              AI Travel Assistant
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Practical answers for packing, seasonal timing, transit routes, and local etiquette.
            </p>
          </div>
          <button
            type="button"
            onClick={resetChat}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Clear chat
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-5">
        {notice && (
          <div
            role="status"
            className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-[#0B1F3A]"
          >
            <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true" />
            <p>{notice}</p>
          </div>
        )}

        {/* Quick-Start Prompts */}
        <div className="flex flex-wrap gap-2" aria-label="Suggested travel questions">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              disabled={typing}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-[#0B1F3A] hover:border-[#0284C7] hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col min-h-[460px] max-h-[65vh] overflow-hidden">
          <div
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
            aria-live="polite"
            aria-label="Conversation history"
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3.5 ${
                      isUser
                        ? 'bg-[#0B1F3A] text-white'
                        : 'bg-[#F8FAFC] border border-slate-200 text-[#0B1F3A]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[11px] opacity-75 mb-1">
                      {!isUser && <Compass className="w-3.5 h-3.5 text-[#0284C7]" aria-hidden="true" />}
                      <span className="font-medium">{isUser ? 'You' : 'TripMate Assistant'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{msg.timestamp}</span>
                    </div>
                    <SafeMessageBody text={msg.content} />
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex justify-start" aria-label="TripMate Assistant is typing">
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center gap-2 text-sm text-slate-600">
                  <Compass className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
                  <span>TripMate is thinking</span>
                  <span className="inline-flex gap-1" aria-hidden="true">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  </span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                {errorMsg}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 p-3 sm:p-4 bg-[#F8FAFC] flex items-end gap-3"
          >
            <label htmlFor="assistant-chat-input" className="sr-only">
              Ask a travel question
            </label>
            <textarea
              id="assistant-chat-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about destinations, packing, transit, or travel budgets..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0284C7] focus:outline-none resize-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send message"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#153159] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
