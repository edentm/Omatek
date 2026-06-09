import { useState, useEffect, useRef, useCallback } from "react";
import { askPlatform, getChatHistory } from "../../api";
import { useTokenLedger } from "../../contexts/TokenLedgerContext";

type Message = { role: "user" | "assistant"; text: string; tokensUsed?: number };
type HistoryItem = { id: number; sessionId: string | null; question: string; answer: string | null; tokensUsed: number | null; createdAt: string };
type Session = { sessionId: string | null; title: string; date: string; items: HistoryItem[] };

const GREETING = "How can I help you today?";
const DEFAULT_TITLE = "New AI Chat";

function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 17 C9 8 27 8 27 17" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <rect x="2" y="15" width="8" height="10" rx="4"/>
      <rect x="26" y="15" width="8" height="10" rx="4"/>
      <circle cx="18" cy="21" r="9"/>
      <circle cx="14" cy="21" r="2.2" fill="white"/>
      <circle cx="22" cy="21" r="2.2" fill="white"/>
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
  const [chatTitle, setChatTitle] = useState(DEFAULT_TITLE);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const isDefaultTitle = chatTitle === DEFAULT_TITLE;

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

  useEffect(() => {
    if (!showOptions) return;
    const handler = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showOptions]);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

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
    setChatTitle(DEFAULT_TITLE);
    setShowHistory(false);
    setShowOptions(false);
    setIsRenaming(false);
  };

  const loadSession = (session: Session) => {
    setSessionId(session.sessionId ?? crypto.randomUUID());
    setChatTitle(session.title);
    const msgs: Message[] = [{ role: "assistant", text: GREETING }];
    for (const item of [...session.items].reverse()) {
      msgs.push({ role: "user", text: item.question });
      if (item.answer) msgs.push({ role: "assistant", text: item.answer, tokensUsed: item.tokensUsed ?? undefined });
    }
    setMessages(msgs);
    setShowHistory(false);
  };

  const handleStartRename = () => {
    setRenameValue(chatTitle);
    setIsRenaming(true);
    setShowOptions(false);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed) setChatTitle(trimmed);
    setIsRenaming(false);
  };

  const handleRenameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setIsRenaming(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || isExhausted) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    if (isDefaultTitle) {
      setChatTitle(text.slice(0, 45) + (text.length > 45 ? "…" : ""));
    }
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
          <div className="px-3 py-2.5 border-b border-[#eaecf0] flex items-center gap-1 shrink-0">

            {/* Left: [bot avatar for named chats] title + history chevron */}
            <div className="relative flex items-center gap-1.5 min-w-0 flex-1" ref={historyRef}>
              {/* Bot avatar — only shown for named (non-default) chats */}
              {!isDefaultTitle && !isRenaming && (
                <div className="size-[26px] rounded-full bg-[#f2f4f7] flex items-center justify-center shrink-0">
                  <BotIcon className="size-[13px] text-[#4b5563]" />
                </div>
              )}

              {/* Inline rename input */}
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={handleRenameKey}
                  onBlur={commitRename}
                  className="flex-1 min-w-0 font-medium text-[14px] text-black bg-transparent border-b border-[#667085] focus:outline-none px-1 py-0.5"
                />
              ) : (
                <button
                  onClick={() => setShowHistory(o => !o)}
                  className="flex items-center gap-1 hover:bg-gray-100 rounded-lg px-1.5 py-1 transition-colors min-w-0"
                >
                  <span className="font-medium text-[14px] text-black truncate max-w-[160px]">{chatTitle}</span>
                  <svg className={`size-4 text-[#667085] shrink-0 transition-transform ${showHistory ? "rotate-180" : ""}`} fill="none" viewBox="0 0 16 16">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              {/* History dropdown */}
              {showHistory && (
                <div className="absolute top-[38px] left-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl w-[300px] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#eaecf0]">
                    <span className="text-[13px] font-semibold text-[#344054]">Chat History</span>
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

            {/* Right: new chat + download + 3-dots + hide */}
            <div className="flex items-center gap-0.5 shrink-0">

              {/* New chat (compose icon) */}
              <button
                onClick={startNewChat}
                title="New chat"
                className="size-8 flex items-center justify-center rounded-lg text-[#667085] hover:text-black hover:bg-gray-100 transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 20 20">
                  <path d="M10 4H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.5 2.5a1.414 1.414 0 0 1 2 2L10 11l-3 1 1-3 6.5-6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Download */}
              <button
                onClick={downloadChat}
                title="Download chat"
                className="size-8 flex items-center justify-center rounded-lg text-[#667085] hover:text-black hover:bg-gray-100 transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 20 20">
                  <path d="M17.5 12.5v3.333A1.667 1.667 0 0 1 15.833 17.5H4.167A1.667 1.667 0 0 1 2.5 15.833V12.5M5.833 8.333 10 12.5l4.167-4.167M10 12.5v-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* 3-dots options menu */}
              <div className="relative" ref={optionsRef}>
                <button
                  onClick={() => setShowOptions(o => !o)}
                  title="More options"
                  className="size-8 flex items-center justify-center rounded-lg text-[#667085] hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="4" cy="10" r="1.5"/>
                    <circle cx="10" cy="10" r="1.5"/>
                    <circle cx="16" cy="10" r="1.5"/>
                  </svg>
                </button>

                {showOptions && (
                  <div className="absolute top-[36px] right-0 z-50 bg-white border border-[#d0d5dd] rounded-[10px] shadow-xl w-[160px] overflow-hidden py-1">
                    <button
                      onClick={handleStartRename}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-[#344054] hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                    >
                      <svg className="size-4 text-[#667085]" fill="none" viewBox="0 0 20 20">
                        <path d="M14.5 2.5a1.414 1.414 0 0 1 2 2L10 11l-3 1 1-3 6.5-6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Rename
                    </button>
                    <button
                      onClick={startNewChat}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-[#b42318] hover:bg-[#fef3f2] transition-colors flex items-center gap-2.5"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 20 20">
                        <path d="M3.333 5h13.334M8.333 9.167v5M11.667 9.167v5M4.167 5l.833 10a1.667 1.667 0 0 0 1.667 1.667h6.666A1.667 1.667 0 0 0 15 15L15.833 5M7.5 5V3.333a.833.833 0 0 1 .833-.833h3.334a.833.833 0 0 1 .833.833V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Delete chat
                    </button>
                  </div>
                )}
              </div>

              {/* Hide chat */}
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
              <div className="flex-1 flex flex-col justify-end pb-5">
                <BotIcon className="size-12 text-[#4b5563] mb-3" />
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[20px] text-black leading-tight">
                  {GREETING}
                </p>
              </div>
            ) : (
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
                  return (
                    <div key={i} className="flex justify-start">
                      <div className="bg-white border border-[#eaecf0] text-[#1d2939] px-3.5 py-2.5 rounded-[14px] rounded-tl-[4px] text-[13px] leading-[22px] max-w-[320px] whitespace-pre-wrap">
                        {msg.text}
                      </div>
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
                className="h-10 w-10 bg-[#144430] rounded-[10px] flex items-center justify-center hover:bg-[#0f3324] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
