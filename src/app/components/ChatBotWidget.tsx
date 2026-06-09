import { useState, useEffect, useRef, useCallback } from "react";
import { askPlatform, getChatHistory } from "../../api";
import { useTokenLedger } from "../../contexts/TokenLedgerContext";

type Message = { role: "user" | "assistant"; text: string; tokensUsed?: number };
type HistoryItem = { id: number; sessionId: string | null; question: string; answer: string | null; tokensUsed: number | null; createdAt: string };
type Session = { sessionId: string | null; title: string; date: string; items: HistoryItem[] };

const GREETING = "How can I help you today?";

function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Headband arc */}
      <path d="M9 17 C9 8 27 8 27 17" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Left ear cup */}
      <rect x="2" y="15" width="8" height="10" rx="4"/>
      {/* Right ear cup */}
      <rect x="26" y="15" width="8" height="10" rx="4"/>
      {/* Face */}
      <circle cx="18" cy="21" r="9"/>
      {/* Eyes */}
      <circle cx="14" cy="21" r="2.2" fill="white"/>
      <circle cx="22" cy="21" r="2.2" fill="white"/>
      {/* Chin / mic arc */}
      <path d="M13 27.5 Q18 32 23 27.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function ChatBotWidget() {
  const { isExhausted, deductTokens } = useTokenLedger();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!showHistory) return;
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showHistory]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await getChatHistory() as HistoryItem[];
      const sessionMap = new Map<string, Session>();
      for (const item of data) {
        const key = item.sessionId ?? `solo-${item.id}`;
        if (!sessionMap.has(key)) {
          sessionMap.set(key, {
            sessionId: item.sessionId,
            title: item.question.slice(0, 45) + (item.question.length > 45 ? "…" : ""),
            date: new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            items: [],
          });
        }
        sessionMap.get(key)!.items.push(item);
      }
      setHistory(Array.from(sessionMap.values()));
    } catch {}
    setHistoryLoading(false);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    loadHistory();
  };

  const startNewChat = () => {
    setSessionId(crypto.randomUUID());
    setMessages([{ role: "assistant", text: GREETING }]);
    setInput("");
    setShowHistory(false);
  };

  const loadSession = (session: Session) => {
    setSessionId(session.sessionId ?? crypto.randomUUID());
    const msgs: Message[] = [{ role: "assistant", text: GREETING }];
    for (const item of [...session.items].reverse()) {
      msgs.push({ role: "user", text: item.question });
      if (item.answer) msgs.push({ role: "assistant", text: item.answer, tokensUsed: item.tokensUsed ?? undefined });
    }
    setMessages(msgs);
    setShowHistory(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || isExhausted) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await askPlatform(text, [], sessionId) as Record<string, unknown>;
      const answer = (res.answer ?? res.response ?? res.message ?? JSON.stringify(res)) as string;
      const rawTokens = res.tokensUsed ?? res.tokens_used;
      const tokensUsed = rawTokens != null ? Number(rawTokens) : undefined;
      setMessages(prev => [...prev, { role: "assistant", text: answer, tokensUsed }]);
      if (tokensUsed != null && tokensUsed > 0) deductTokens(tokensUsed);
      loadHistory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const downloadChat = () => {
    const turns = messages.filter((_, i) => i > 0);
    if (turns.length === 0) return;
    const lines = turns
      .map(m => `**${m.role === "user" ? "You" : "AI Assistant"}**: ${m.text}`)
      .join("\n\n---\n\n");
    const md = `# Omatek AI Chat Export\n*Exported: ${new Date().toLocaleString()}*\n\n---\n\n${lines}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `omatek-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const isGreetingOnly = messages.length === 1;

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[900] size-12 bg-white border border-[#d0d5dd] rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Open AI Assistant"
        >
          <BotIcon className="size-6 text-[#4b5563]" />
        </button>
      )}

      {/* Side panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-screen w-[420px] bg-white border-l border-[#eaecf0] shadow-2xl z-[900] flex flex-col">

          {/* Header */}
          <div className="px-4 py-3 border-b border-[#eaecf0] flex items-center justify-between shrink-0">

            {/* Left: title + history chevron */}
            <div className="relative" ref={historyRef}>
              <button
                onClick={() => setShowHistory(o => !o)}
                className="flex items-center gap-1 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
              >
                <span className="font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black">New AI Chat</span>
                <svg className={`size-4 text-[#667085] transition-transform ${showHistory ? "rotate-180" : ""}`} fill="none" viewBox="0 0 16 16">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* History dropdown */}
              {showHistory && (
                <div className="absolute top-[38px] left-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl w-[300px] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#eaecf0] flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#344054]">Chat History</span>
                    <button onClick={startNewChat} className="text-[12px] text-[#144430] font-medium hover:underline">
                      + New chat
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto py-1">
                    {historyLoading && <p className="text-[12px] text-[#98a2b3] px-4 py-2">Loading…</p>}
                    {!historyLoading && history.length === 0 && (
                      <p className="text-[12px] text-[#98a2b3] px-4 py-3">No chat history yet.</p>
                    )}
                    {history.map((session, i) => (
                      <button
                        key={i}
                        onClick={() => loadSession(session)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-[13px] text-[#344054] font-medium truncate">{session.title}</p>
                        <p className="text-[11px] text-[#98a2b3] mt-0.5">{session.date} · {session.items.length} msg{session.items.length !== 1 ? "s" : ""}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: download + hide */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={downloadChat}
                title="Download chat"
                className="size-8 flex items-center justify-center rounded-lg text-[#667085] hover:text-black hover:bg-gray-100 transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 20 20">
                  <path d="M17.5 12.5v3.333A1.667 1.667 0 0 1 15.833 17.5H4.167A1.667 1.667 0 0 1 2.5 15.833V12.5M5.833 8.333 10 12.5l4.167-4.167M10 12.5v-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Hide chat"
                className="size-8 flex items-center justify-center rounded-lg text-[#667085] hover:text-black hover:bg-gray-100 transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 20 20">
                  <path d="M11 5l5 5-5 5M4 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 flex flex-col">
            {isGreetingOnly ? (
              /* Greeting state: icon + text at bottom-left */
              <div className="flex-1 flex flex-col justify-end pb-5">
                <BotIcon className="size-12 text-[#4b5563] mb-3" />
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[20px] text-black leading-tight">
                  {GREETING}
                </p>
              </div>
            ) : (
              /* Conversation */
              <div className="flex flex-col gap-4 py-5">
                {messages.slice(1).map((msg, i) => {
                  if (msg.role === "user") {
                    return (
                      <div key={i} className="flex justify-end">
                        <div className="bg-[#f2f4f7] text-[#344054] px-3.5 py-2.5 rounded-[14px] rounded-tr-[4px] text-[13px] leading-[20px] max-w-[300px] whitespace-pre-wrap">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }
                  /* AI response: plain left-aligned text, no bubble, no icon */
                  return (
                    <div key={i} className="text-[13px] leading-[22px] text-[#1d2939] whitespace-pre-wrap max-w-[360px]">
                      {msg.text}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#667085] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-1.5 rounded-full bg-[#667085] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-1.5 rounded-full bg-[#667085] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[#eaecf0] shrink-0">
            {isExhausted && (
              <p className="text-[11px] text-[#b42318] mb-2">API balance exhausted — recharge required.</p>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={isExhausted ? "API balance exhausted" : "Ask anything…"}
                rows={1}
                disabled={isExhausted}
                className="flex-1 px-3 py-2.5 border border-[#d0d5dd] rounded-[10px] text-[13px] text-[#344054] resize-none focus:outline-none focus:border-[#667085] placeholder:text-[#98a2b3] disabled:bg-[#f9fafb] disabled:cursor-not-allowed leading-[20px]"
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading || isExhausted}
                className="size-9 bg-[#144430] rounded-[9px] flex items-center justify-center hover:bg-[#0f3324] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <svg className="size-4" viewBox="0 0 20 20" fill="none">
                  <path d="M17.5 10L2.5 2.5L6.25 10L2.5 17.5L17.5 10Z" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
